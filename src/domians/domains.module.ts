import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PropertyModule } from './property/property.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'src/domians/prisma/prisma.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { UserController } from './user/user.controller';
import { PropertyController } from './property/property.controller';
import { UserService } from './user/user.service';
import { PrismaService } from 'src/domians/prisma/prisma.service';
import { CloudinaryService } from './helper/cloudinary.service';
import { AuthController } from './auth/auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './middleware/auth.guard';
import 'dotenv/config';

@Module({
    providers: [
        UserService,
        PrismaService,
        CloudinaryService,
        { provide: APP_GUARD, useClass: RolesGuard }
    ],
    imports: [
        PrismaModule,
        AuthModule,
        PropertyModule,
        UserModule
    ],
})
export class DomainsModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .exclude(
                { path: '/auth/register', method: RequestMethod.POST },
                { path: '/auth/login', method: RequestMethod.POST },
                { path: '/properties/all-available', method: RequestMethod.GET },
                { path: '/properties/:id', method: RequestMethod.GET }
            ).forRoutes(AuthController, UserController, PropertyController);
    }
}
