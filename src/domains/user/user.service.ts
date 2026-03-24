import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { hash, compare } from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/domains/prisma/prisma.service';
import { CloudinaryService } from 'src/domains/helper/cloudinary.service';
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

    let uploadedPublicId: string | null = null;

    if (file) {
      const data = await this.cloudinary.uploadImage(file);
      createUserDto.image = data.url;
      createUserDto.publicId = data.public_id;
      createUserDto.resourceType = data.resource_type,
      uploadedPublicId = data.public_id;
    }

    createUserDto.password = await hash(createUserDto.password, 10);

     let user;
    try {
      user = await this.prisma.user.create({
        data: createUserDto
      });
    } catch (error) {
      if (uploadedPublicId) {
        await this.cloudinary.deleteImages([uploadedPublicId]).catch(() => {});
     }
      throw error;
   }

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

      }

      updateUserDto.image = data.url;
      updateUserDto.publicId = data.public_id;
      updateUserDto.resourceType = data.resource_type;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto
    })

    if (updatedUser && updateUserDto.image && userExist.publicId) {
      await this.cloudinary.deleteImages([userExist.publicId])
    }

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
      await this.cloudinary.deleteImages([userExist.publicId]);
    }

    await this.prisma.user.delete({ where: { id } });

    return {
      status: 'success',
      message: 'Account deleted successfully'
    }
  }
}
