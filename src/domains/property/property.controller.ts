import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Injectable, PipeTransform, BadRequestException, UsePipes, Req, Query, UploadedFile } from '@nestjs/common';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from '../helper/file.validation';
import { Role, Roles } from '../middleware/auth.guard';
import { QueryPropertyDto } from './dto/query-property.dto';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) { }

  @Post('create')
  @Roles(Role.ADMIN, Role.AGENT)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'images', maxCount: 5 },
  ]))
  @UsePipes(ImageValidationPipe)
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Req() req
  ) {
    const { id } = req.user;
    const newFiles = files && files.images ? files.images : [];

    return this.propertyService.create(id, createPropertyDto, newFiles);
  }

  @Get()
  @Roles(Role.ADMIN, Role.AGENT)
  findAll(
    @Req() req,
    @Query() query: QueryPropertyDto
  ) {
    const { id } = req.user;
    return this.propertyService.findAllForAdmins(query, id);
  }

  @Get('all-available')
  findAllAvailable(
    @Query() query: QueryPropertyDto
  ) {
    return this.propertyService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto, @Req() req) {

    return this.propertyService.update(id, req.user.id, updatePropertyDto);
  }

  @Patch('image/:id')
  @Roles()
  @UseInterceptors(FileInterceptor('image'))
  @UsePipes(ImageValidationPipe)
  updatePropertyImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.propertyService.updatePropertyImage(id, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.propertyService.remove(id, req.user.id);
  }
}
