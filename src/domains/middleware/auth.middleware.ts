import { HttpException, HttpStatus, Inject, Injectable, Logger, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";


@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private jwtService: JwtService,
        private readonly prisma: PrismaService
    ) { }

    async use(req: any, res: any, next: (error?: any) => void) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedException('Unauthenticated access.');
        }

        const token = authHeader.split(' ')[1];

         if (!token || !authHeader.toLowerCase().startsWith('bearer ')) {
            throw new UnauthorizedException('Invalid authorization header format');
        }

        const checkActiveSession = await this.cacheManager.get(`user_${token}`);

        if (!checkActiveSession) {
            Logger.error('User has no valid active session');
            throw new UnauthorizedException('Unauthorized access');
        }

        try {

            const { userId } = this.jwtService.verify(token);

            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                omit: { password: true }
            });

            if (!user) {
                throw new UnauthorizedException('Unauthenticated user access');
            }

            let ttl = Number(process.env.Redis_TTL) || 36000000;

            await this.cacheManager.set(`user_${token}`, token, ttl);

            req.user = { id: user.id, role: user.role, token };
            next();
        } catch (error) {
            Logger.error('authentication error: ', error)
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new UnauthorizedException('invalid token');
        }

    }
}