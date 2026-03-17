import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PropertyModule } from './property/property.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PropertyModule,
    PrismaModule,
    UserModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
