import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/domians/prisma/prisma.service';
import { CloudinaryService } from 'src/domians/helper/cloudinary.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, CloudinaryService],
})
export class UserModule { }
