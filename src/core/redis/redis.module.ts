import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redis = new Redis({
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          password: config.get<string>('REDIS_PASSWORD'),
          db: config.get<number>('REDIS_DB', 0),
          lazyConnect: false,
          retryStrategy(times) {
            return Math.min(times * 500, 10_000);
          },
        });

        redis.on('connect', () => {
          Logger.log('🟢 Redis connected', 'Reddis Module');
        });

        redis.on('ready', () => {
          Logger.log('✅ Redis ready', 'Reddis Module');
        });

        redis.on('error', (err) => {
          Logger.error(`🔴 Redis error: ${err.message}`, 'Reddis Module');
        });

        redis.on('close', () => {
          Logger.warn('⚠️ Redis connection closed', 'Reddis Module');
        });

        redis.on('reconnecting', () => {
          Logger.warn('🔄 Redis reconnecting...', 'Reddis Module');
        });
        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
