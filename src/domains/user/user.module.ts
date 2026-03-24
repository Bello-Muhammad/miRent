import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HelperModule } from '../helper/helper.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [PrismaModule, HelperModule],
  exports: [UserService]
})
export class UserModule { }
