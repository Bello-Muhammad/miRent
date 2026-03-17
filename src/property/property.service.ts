import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Duration, PropertyType } from 'src/generated/prisma/enums';
import { CloudinaryService } from '../helper/cloudinary.service';

@Injectable()
export class PropertyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  async create(createPropertyDto: CreatePropertyDto, files: Express.Multer.File[]) {

    const newProperty = await this.prisma.$transaction(async (prisma) => {
      const newProperty = await prisma.property.create({
        data: {
          title: createPropertyDto.title,
          description: createPropertyDto.description,
          type: createPropertyDto.type as PropertyType,
          amount: createPropertyDto.amount,
          duration: createPropertyDto.duration as Duration,
          address: createPropertyDto.address,
          city: createPropertyDto.city,
          state: createPropertyDto.state,
          country: createPropertyDto.country
        }
      });

      const uploadResults = await this.cloudinaryService.uploadMultipleImages(files, newProperty.id);

      await prisma.image.createMany({
        data: uploadResults
      })

      return {
        status: 'success',
        message: 'Property created successfully',
        data: newProperty
      };
    });

    return newProperty;
  }

  findAll() {
    return this.prisma.property.findMany({
      relationLoadStrategy: 'join',
      include: { images: true }
    })
  }

  //to be implement
  // findAllUserProperty(userId: string) {}

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

  async update(id: string, updatePropertyDto: UpdatePropertyDto) {
    const existing = await this.prisma.property.findUnique({ where: { id } })

    if (!existing) {
      throw new HttpException('Property to update not found!.', HttpStatus.NOT_FOUND);
    }

    return this.prisma.property.update({
      where: { id },
      data: {
        title: updatePropertyDto.title || existing.title,
        description: updatePropertyDto.description || existing.description,
        type: updatePropertyDto.type as PropertyType || existing.type,
        amount: updatePropertyDto.amount || existing.amount,
        address: updatePropertyDto.address || existing.address,
        city: updatePropertyDto.city || existing.city,
        state: updatePropertyDto.state || existing.state,
        duration: updatePropertyDto.duration as Duration || existing.duration
      }
    });
  }

  async remove(id: string) {
    const data = await this.prisma.property.findUnique({
      where: {
        id
      }
    });

    if (!data) {
      throw new HttpException('Property do not exist again!.', HttpStatus.NOT_FOUND);
    }

    await this.prisma.property.delete({
      where: {
        id
      }
    });

    return { message: "Property deleted successfully" }
  }
}
