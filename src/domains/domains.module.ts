import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PropertyModule } from './property/property.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'src/domains/prisma/prisma.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { UserController } from './user/user.controller';
import { PropertyController } from './property/property.controller';
import { AuthController } from './auth/auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './middleware/auth.guard';
import { HelperModule } from './helper/helper.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
    providers: [
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: APP_GUARD, useClass: ThrottlerGuard },

    ],
    imports: [
        PrismaModule,
        AuthModule,
        PropertyModule,
        UserModule,
        HelperModule,
        ThrottlerModule.forRoot([
            {
                name: 'base',
                ttl: 1860000, //30min
                limit: 200
            },
            {
                name: 'daily',
                ttl: 864000, //24hrs
                limit: 400
            },
        ])
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
