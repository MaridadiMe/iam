import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth-guard';
import { ApiBody } from '@nestjs/swagger';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { RequestPasswordChangeDto } from '../dtos/request-password-change.dto';
import { Response } from 'express';
import { PublicRoute } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @PublicRoute()
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
  @PublicRoute()
  async requestPasswordChange(@Body() dto: RequestPasswordChangeDto) {
    const data = await this.authService.requestPasswordChange(dto);
    return new BaseResponseDto(data);
  }

  @Get('public-key')
  @HttpCode(200)
  @PublicRoute()
  getPublicKey(@Res() res: Response): Response {
    const key = this.authService.getPublicKey();
    return res.setHeader('Content-Type', 'text/plain').send(key);
  }
}
