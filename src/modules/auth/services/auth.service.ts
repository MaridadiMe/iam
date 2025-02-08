import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';
import { RequestPasswordChangeDto } from '../dtos/request-password-change.dto';
import { UserService } from 'src/modules/users/services/user.service';
import { User } from 'src/modules/users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  signIn(user: UserResponseDto): { accessToken: string } {
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      permissions: user.permissions,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async requestPasswordChange(payload: RequestPasswordChangeDto) {
    let user: User;
    try {
      user = await this.userService.findUserByEmail(payload.email);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('An error was encountered');
    }

    const resp = {
      message: 'Check your email address for a link to change your password',
    };

    if (!user) {
      this.logger.error(
        `Attempt to change password for non-existing user: ${payload.email}`,
      );
      return resp;
    }

    // actually send email here.
    this.logger.log(`Password change requested for user with ID: ${user.id}`);

    return resp;
  }

  getPublicKey() {
    try {
      const key = fs.readFileSync(
        path.join(
          __dirname,
          `../../../../${this.configService.get('PUBLIC_KEY_FILE_PATH')}`,
        ),
        'utf8',
      );
      return key;
    } catch (error) {
      this.logger.error(`Error While Reading Key: ${error}`);
      throw new InternalServerErrorException(`Key Not Found`);
    }
  }
}
