import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserResponseDto } from 'src/modules/user/dtos/user-response.dto';
import { UserService } from 'src/modules/user/services/user.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: fs.readFileSync(
        path.join(
          __dirname,
          `../../../../${configService.get('PUBLIC_KEY_FILE_PATH')}`,
        ),
        'utf8',
      ),
      algorithms: [configService.get('KEY_SIGNING_ALGORITHM')],
    });
  }

  async validate(payload: any) {
    const user: UserResponseDto = await this.userService.findUserById(
      payload.id,
    );
    if (user) {
      return user;
    }
    return {
      id: payload.sub,
      phone: payload.phone,
      email: payload.email,
      firstName: payload.lastName,
      lastName: payload.lastName,
    };
  }
}
