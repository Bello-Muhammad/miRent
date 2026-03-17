import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UsePipes, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from 'src/helper/file.validation';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @UsePipes(ImageValidationPipe.bind(ImageValidationPipe.prototype.validateFile))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: CreateUserDto
  ) {

    return this.userService.create(createUserDto, file);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  @UsePipes(ImageValidationPipe.bind(ImageValidationPipe.prototype.validateFile))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.update(id, updateUserDto, file);
  }


  @Patch('/change-password/:id')
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePasword(id, changePasswordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
