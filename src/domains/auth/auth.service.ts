import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/domains/prisma/prisma.service';
import { LoginDto } from './dto/login-auth.dto';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
    private jwtService: JwtService
  ) { }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateCredentials(email, password);
    const token = await this.jwtService.sign({ userId: user.id });

    let key = `user_${token}`;
    let ttl = Number(process.env.Redis_TTL) || 36000000

    await this.cacheManager.set(key, token, ttl)

    return {
      status: 'success',
      message: 'Account login successfully.',
      data: { userId: user.id, token }
    };
  }

  async logOut(id: string, token: string) {

    const userExist = await this.prisma.user.findUnique({
      where: { id }
    });

    if(!userExist) {
      throw new HttpException('account not found', HttpStatus.NOT_FOUND)
    }

    const session = await this.cacheManager.get(`user_${token}`);

    if(!session) {
      throw new UnauthorizedException('Unauthorized access.')
    }
    
    await this.cacheManager.del(`user_${token}`)

    return {
      status: 'success',
      message: 'User logged out successfully'
    }
  }

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
