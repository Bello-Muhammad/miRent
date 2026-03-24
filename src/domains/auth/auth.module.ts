import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CloudinaryService } from 'src/domains/helper/cloudinary.service';
import { UserModule } from '../user/user.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    CloudinaryService
  ],
  imports: [PrismaModule, UserModule],
})
export class AuthModule { }
