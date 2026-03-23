import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/domians/prisma/prisma.service';
import { UserService } from 'src/domians/user/user.service';
import { UserModule } from 'src/domians/user/user.module';
import { CloudinaryService } from 'src/domians/helper/cloudinary.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService, 
    PrismaService, 
    // JwtService, 
    UserService, 
    CloudinaryService],
})
export class AuthModule { }
