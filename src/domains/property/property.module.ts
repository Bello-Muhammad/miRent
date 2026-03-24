import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { PrismaModule } from 'src/domains/prisma/prisma.module';
import { HelperModule } from '../helper/helper.module';

@Module({
  imports: [PrismaModule, HelperModule],
  controllers: [PropertyController],
  providers: [
    PropertyService,
  ],
})
export class PropertyModule { }
