import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local/local.strategy';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          privateKey: fs.readFileSync(
            path.join(
              __dirname,
              `../../../${configService.get('PRIVATE_KEY_FILE_PATH')}`,
            ),
            'utf8',
          ),
          publicKey: fs.readFileSync(
            path.join(
              __dirname,
              `../../../${configService.get('PUBLIC_KEY_FILE_PATH')}`,
            ),
            'utf8',
          ),
          signOptions: {
            algorithm: configService.get('KEY_SIGNING_ALGORITHM'),
            expiresIn: '30000s',
          },
        };
      },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
