import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UsePipes, UploadedFile, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from 'src/domians/helper/file.validation';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Role, Roles } from '../middleware/auth.guard';
import { AdminActionDto } from './dto/admin-action.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Get('profile')
  @Roles(Role.ADMIN, Role.AGENT)
  profile(
    @Req() req
  ) {
    return this.userService.findOne(req.user.id);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('profile/edit')
  @Roles()
  @UseInterceptors(FileInterceptor('image'))
  @UsePipes(ImageValidationPipe)
  update(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.update(req.user.id, updateUserDto, file);
  }

  @Patch('profile/change-password')
  changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(req.user.id, changePasswordDto);
  }

  @Patch('action/:id')
  @Roles(Role.ADMIN)
  accountAction(
    @Param('id') id: string,
    @Body() adminActionDto: AdminActionDto,
  ) {
    return this.userService.accountAction(id, adminActionDto);
  }

  @Delete('profile/delete-account')
  accountDeletion(@Req() req) {
    return this.userService.remove(req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
