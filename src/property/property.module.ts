import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ImageValidationPipe } from '../helper/file.validation';
import { CloudinaryService } from '../helper/cloudinary.service';

@Module({
  imports: [PrismaModule],
  controllers: [PropertyController],
  providers: [
    PropertyService,
    PrismaService,
    ImageValidationPipe,
    CloudinaryService
  ],
})
export class PropertyModule { }
