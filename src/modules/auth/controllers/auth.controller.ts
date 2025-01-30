import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth-guard';
import { ApiBody } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { RequestPasswordChangeDto } from '../dtos/request-password-change.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['email', 'password'],
    },
  })
  async login(
    @Request() req,
  ): Promise<BaseResponseDto<{ accessToken: string }>> {
    const data = this.authService.signIn(req.user);
    return new BaseResponseDto(data);
  }

  @Post('pasword/change-request')
  @HttpCode(200)
  async requestPasswordChange(@Body() dto: RequestPasswordChangeDto) {
    return await this.authService.requestPasswordChange(dto);
  }
}
