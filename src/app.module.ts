import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { JwtModule } from '@nestjs/jwt';
import { DomainsModule } from './domains/domains.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-yet';
import KeyvRedis, { createKeyv } from '@keyv/redis';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, load: [config] }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('jwtSecret')
      }),
      global: true,
      inject: [ConfigService]
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: async (config) => ({
        stores: [
          new KeyvRedis(config.get('redisUrl'))
        ]
      }),
      inject: [ConfigService]
    }),
    DomainsModule,
  ],
})
export class AppModule { }
