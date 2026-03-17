import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/helper/cloudinary.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService
  ) { }

  async create(createUserDto: CreateUserDto, file: Express.Multer.File) {

    const userExist = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
    });

    if (userExist) {
      throw new HttpException('User exist already', HttpStatus.BAD_REQUEST)
    }

    if (file) {
      const data = await this.cloudinary.uploadImage(file);
      createUserDto.image = data.url;
      createUserDto.publicId = data.public_id;
      createUserDto.resourceType = data.resource_type
    }

    createUserDto.password = await hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: createUserDto
    });

    return {
      status: 'success',
      message: 'Account created successfully',
      data: user
    };
  }

  async findAll() {
    const users = await this.prisma.user.findMany()
    return {
      status: 'success',
      meesage: 'Users fetched successfuly',
      data: users
    };
  }

  async findOne(id: string) {
    const userExist = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!userExist) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    return {
      status: 'success',
      message: 'User fetched successfuly',
      data: userExist
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, file: Express.Multer.File) {
    const userExist = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!userExist) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    if (file) {
      if (userExist.publicId) {
        let resourceType = userExist.resourceType ? userExist.resourceType : 'image'
        await this.cloudinary.deleteImage(userExist.publicId, resourceType)
      }

      const data = await this.cloudinary.uploadImage(file);
      updateUserDto.image = data.url;
      updateUserDto.publicId = data.public_id;
      updateUserDto.resourceType = data.resource_type;
    }

    await this.prisma.user.update({
      where: { id },
      data: updateUserDto
    })
    return {
      status: 'success',
      message: 'User data updated successfully'
    };
  }

  async changePasword(id: string, changePasswordDto: ChangePasswordDto) {
    const userExist = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!userExist) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    const isMatch = await compare(changePasswordDto.currentPassword, userExist.password);

    if (!isMatch) {
      throw new HttpException('Current password is not correct', HttpStatus.BAD_REQUEST)
    }

    let password = await hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: {
        password
      }
    });

    return {
      status: 'success',
      message: 'Account password updated successfully'
    }
  }

  async remove(id: string) {

    const userExist = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!userExist) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    await this.prisma.user.delete({ where: { id }});

        return {
      status: 'success',
      message: 'Account deleted successfully'
    }
  }
}
