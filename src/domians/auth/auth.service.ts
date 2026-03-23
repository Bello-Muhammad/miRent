import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/domians/prisma/prisma.service';
import { LoginDto } from './dto/login-auth.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) { }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateCredentials(email, password);
    const token = await this.jwtService.sign({ userId: user.id }, { expiresIn: '1h' });


    return {
      status: 'success',
      message: 'Account login successfully.',
      data: { userId: user.id, token }
    };
  }

  // logOut(id: number) {
  //   return `This action removes a #${id} auth`;
  // }

  private async validateCredentials(email: string, password: string) {

    const user = await this.prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credential.');
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException("Invalid credential");
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account has already been suspended. Contact support for help or reason.');
    }

    return user;
  }
}
