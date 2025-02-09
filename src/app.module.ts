import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConnectionOptions } from './core/config/database.config';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth-guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configSevice: ConfigService) =>
        databaseConnectionOptions(configSevice),
    }),
    UserModule,
    AuthModule,
  ],
  providers: [
    // Reflector,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
