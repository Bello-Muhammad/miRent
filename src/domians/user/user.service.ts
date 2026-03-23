import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/domians/prisma/prisma.service';
import { CloudinaryService } from 'src/domians/helper/cloudinary.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminActionDto } from './dto/admin-action.dto';

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

    const { password, ...User } = user;

    return {
      status: 'success',
      message: 'Account created successfully',
      data: User
    };

  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      omit: { password: true }
    })

    return {
      status: 'success',
      message: 'Users fetched successfully',
      data: users
    };
  }

  async findOne(id: string) {

    const userExist = await this.prisma.user.findUnique({
      where: { id },
      omit: { password: true }
    });

    if (!userExist) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    return {
      status: 'success',
      message: 'User fetched successfully',
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
      const data = await this.cloudinary.uploadImage(file);

      if (userExist.publicId) {
        let resourceType = userExist.resourceType ? userExist.resourceType : 'image'
        await this.cloudinary.deleteImage(userExist.publicId, resourceType)
      }

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

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
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

    async accountAction(id: string, adminActionDto: AdminActionDto) {
    const userExist = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!userExist) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    await this.prisma.user.update({
      where: { id },
      data: adminActionDto
    })
    return {
      status: 'success',
      message: `Account ${adminActionDto.status} successfully`
    };
  }

  async remove(id: string) {

    const userExist = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!userExist) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
    }

    if (userExist.publicId) {
      const resourceType = userExist.resourceType || 'image';
      await this.cloudinary.deleteImage(userExist.publicId, resourceType);
    }

    await this.prisma.user.delete({ where: { id } });

    return {
      status: 'success',
      message: 'Account deleted successfully'
    }
  }
}
