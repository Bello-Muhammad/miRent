import { HttpException, HttpStatus, Injectable, Logger, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private jwtService: JwtService, private readonly prisma: PrismaService) { }

    async use(req: any, res: any, next: (error?: any) => void) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedException('Unauthenticated access.');
        }

        const token = authHeader.split(' ')[1];

        try {
            const { userId } = this.jwtService.verify(token);

            const user = await this.prisma.user.findUnique({
                where: { id: userId }
            });

            if(!user) {
                throw new UnauthorizedException('Unauthenticated user access')
            }
           
            req.user = user;
            next();
        } catch (error) {
            throw new UnauthorizedException('invalid token');
        }

    }
}