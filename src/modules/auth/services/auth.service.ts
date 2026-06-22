import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserResponseDto } from 'src/modules/users/dtos/user-response.dto';
import { RequestPasswordChangeDto } from '../dtos/request-password-change.dto';
import { GoogleLoginDto } from '../dtos/google-login.dto';
import { UserService } from 'src/modules/users/services/user.service';
import { User } from 'src/modules/users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

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
      userName: user.userName,
      role: user.role,
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

  async googleLogin(dto: GoogleLoginDto): Promise<{ accessToken: string }> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const client = new OAuth2Client(clientId);

    let googlePayload: TokenPayload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: dto.idToken,
        audience: clientId,
      });
      googlePayload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    if (!googlePayload) {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    const user = await this.userService.findOrCreateGoogleUser(googlePayload);
    return this.signIn(user);
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
