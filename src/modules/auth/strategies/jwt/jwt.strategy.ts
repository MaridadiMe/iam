import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';
import { UserService } from 'src/modules/users/services/user.service';
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
          `../../../../../${configService.get('PUBLIC_KEY_FILE_PATH')}`,
        ),
        'utf8',
      ),
      algorithms: [configService.get('KEY_SIGNING_ALGORITHM')],
    });
  }

  async validate(payload: any) {
    //Consider proper implementation here if we really need fresh user data.

    // const user: UserResponseDto = await this.userService.findUserById(
    //   payload.id,
    // );
    // if (user) {
    //   console.log('this is the user', user);
    //   return user;
    // }

    const { sub, ...rest } = payload;

    return {
      id: sub,
      ...rest,
    };
  }
}
