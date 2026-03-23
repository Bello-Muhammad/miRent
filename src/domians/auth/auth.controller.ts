import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UsePipes, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from 'src/domians/user/user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from 'src/domians/helper/file.validation';
import { LoginDto } from './dto/login-auth.dto';
import { Role, Roles } from '../middleware/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
  @UsePipes(ImageValidationPipe)
  register(
    @Body() createAuthDto: CreateAuthDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.create(createAuthDto, file);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // @Post('logout')
  // // @Roles(Role.ADMIN, Role.AGENT)
  // logOut(@Param('id') id: string) {
  //   return this.authService.logOut(+id);
  // }
}
