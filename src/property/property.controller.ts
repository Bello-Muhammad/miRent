import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Injectable, PipeTransform, BadRequestException, UsePipes } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from '../helper/file.validation';



@Controller('propertys')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) { }

  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'images', maxCount: 5 },
  ]))
  @UsePipes(ImageValidationPipe)
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] }
  ) {

    const newFiles = files && files.images ? files.images : [];

    return this.propertyService.create(createPropertyDto, newFiles);
  }

  @Get()
  findAll() {
    return this.propertyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertyService.update(id, updatePropertyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertyService.remove(id);
  }
}
