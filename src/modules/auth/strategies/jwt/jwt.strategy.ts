import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserResponseDto } from 'src/modules/user/dtos/user-response.dto';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.APPLICATION_SECRET_KEY,
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
