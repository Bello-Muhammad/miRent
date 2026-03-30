import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Duration, PropertyStatus, PropertyType, Role } from 'src/generated/prisma/enums';
import { CloudinaryService } from '../helper/cloudinary.service';
import { QueryPropertyDto } from './dto/query-property.dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class PropertyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService
  ) { }

  async create(ownerId: string, createPropertyDto: CreatePropertyDto, files: Express.Multer.File[]) {
    if (!files?.length) {
      throw new HttpException({ message: 'Property image must be provided' }, HttpStatus.BAD_REQUEST);
    }
    console.log(files)
    console.log(createPropertyDto)

    const uploadResults = await this.cloudinary.uploadMultipleImages(files);

    if (!uploadResults?.length) {
      throw new HttpException({ message: 'Image upload failed' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const property = await this.prisma.$transaction(async (prisma) => {
      const property = await prisma.property.create({
        data: {
          ...createPropertyDto,
          type: createPropertyDto.type as PropertyType,
          duration: createPropertyDto.duration as Duration,
          status: createPropertyDto.status as PropertyStatus,
          ownerId,
          images: {
            createMany: { data: uploadResults },
          },
        },
        include: { images: true },
      });

      return property;
    });

    return {
      status: 'success',
      message: 'Property created successfully',
      data: property,
    };
  }

  async findAll(query: QueryPropertyDto) {
    const { state, city, address, page = 1, limit = 10 } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.propertyWhereInput = {
      status: PropertyStatus.AVAILABLE,
      ...(state && { state: { contains: state, mode: Prisma.QueryMode.insensitive } }),
      ...(city && { city: { contains: city, mode: Prisma.QueryMode.insensitive } }),
      ...(address && { address: { contains: address, mode: Prisma.QueryMode.insensitive } }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        relationLoadStrategy: 'join',
        include: {
          images: true, user: {
            select: {
              id: true,
              name: true,
              phone: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      status: 'success',
      message: 'Properties fetched successfully',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findAllForAdmins(query: QueryPropertyDto, id: string | null = null) {
    const { state, city, address, page = 1, limit = 10 } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.propertyWhereInput = {
      ...(state && { state: { contains: state, mode: Prisma.QueryMode.insensitive } }),
      ...(city && { city: { contains: city, mode: Prisma.QueryMode.insensitive } }),
      ...(address && { address: { contains: address, mode: Prisma.QueryMode.insensitive } }),
    };

    if (id) {
      where.ownerId = id;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        relationLoadStrategy: 'join',
        include: {
          images: true
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      status: 'success',
      message: 'Properties fetched successfully',
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const data = await this.prisma.property.findUnique({
      where: {
        id
      },
      relationLoadStrategy: 'join',
      include: { images: true }
    });

    if (!data) {
      throw new HttpException('Property not found', HttpStatus.NOT_FOUND);
    }

    return data
  }

  async update(id: string, ownerId: string, updatePropertyDto: UpdatePropertyDto) {
    const existing = await this.prisma.property.findUnique({ where: { id, ownerId } })

    if (!existing) {
      throw new HttpException('Property to update not found!.', HttpStatus.NOT_FOUND);
    }

    return this.prisma.property.update({
      where: { id, ownerId },
      data: {
        title: updatePropertyDto.title ?? existing.title,
        description: updatePropertyDto.description ?? existing.description,
        type: (updatePropertyDto.type as PropertyType) ?? existing.type,
        amount: updatePropertyDto.amount ?? existing.amount,
        address: updatePropertyDto.address ?? existing.address,
        city: updatePropertyDto.city ?? existing.city,
        state: updatePropertyDto.state ?? existing.state,
        status: (updatePropertyDto.status as PropertyStatus) ?? existing.status,
        duration: (updatePropertyDto.duration as Duration) ?? existing.duration,
        area: updatePropertyDto.area ?? existing.area,
      }
    });
  }

  async updatePropertyImage(id: string, ownerId: string, file: Express.Multer.File) {

    const existing = await this.prisma.image.findFirst({
      where: { 
        id,
        property: { ownerId }
       }
    })

    if (!existing) {
      throw new HttpException('Property image not found', HttpStatus.NOT_FOUND);
    }

    const data = await this.cloudinary.uploadImage(file);
    let oldPublicId = existing.publicId;

    try {

      await this.prisma.image.update({
        where: { id },
        data: {
          url: data.secure_url,
          publicId: data.public_id,
          resourceType: data.resource_type
        }
      });

    } catch (error) {
      await this.cloudinary.deleteImages([data.publicId])
      throw new HttpException('Failed to update image record', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.cloudinary.deleteImages([oldPublicId]).catch(() => {
      Logger.error('old image clean up from cloudinary failed')
   });

    return {
      status: 'success',
      message: 'Property image updated successfully'
    }
  }

  async remove(id: string, ownerId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id, ownerId },
      include: { images: true },
    });

    if (!property) {
      throw new HttpException('Property not found', HttpStatus.NOT_FOUND);
    }

    // run DB delete and Cloudinary delete concurrently
    await Promise.all([
      this.prisma.property.delete({ where: { id, ownerId } }),

      property.images?.length
        ? this.cloudinary.deleteImages(
          property.images.map((img) => img.publicId),
        )
        : Promise.resolve(),
    ]);

    return { status: 'success', message: 'Property deleted successfully' };
  }
}
