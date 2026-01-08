// services/otp.service.ts
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { OtpRepository } from '../repositories/otp.repository';
import { OtpPurpose } from '../enums/otp-purpose.enum';
import { OtpEntity } from '../entities/otp.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OtpService {
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    private readonly otpRepo: OtpRepository,
    private readonly configService: ConfigService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private createHash(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  private createIdentifierHash(identifier: string): string {
    const secret = this.configService.get<string>('OTP_HMAC_SECRET');
    return crypto.createHmac('sha256', secret).update(identifier).digest('hex');
  }

  async requestOtp(
    purpose: OtpPurpose,
    identifier: string,
  ): Promise<{ otp: string }> {
    const existing = await this.otpRepo.find(
      purpose,
      this.createIdentifierHash(identifier),
    );
    if (existing) {
      throw new BadRequestException('OTP already sent');
    }

    const otp = this.generateOtp();

    const entity: OtpEntity = {
      hash: this.createHash(otp),
      attempts: 0,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    await this.otpRepo.save(
      purpose,
      this.createIdentifierHash(identifier),
      entity,
    );

    return { otp };
  }

  async verifyOtp(
    purpose: OtpPurpose,
    identifier: string,
    otp: string,
  ): Promise<void> {
    const entity = await this.otpRepo.find(
      purpose,
      this.createIdentifierHash(identifier),
    );

    if (!entity) {
      throw new UnauthorizedException('OTP expired or invalid');
    }

    if (entity.attempts >= this.MAX_ATTEMPTS) {
      await this.otpRepo.delete(purpose, identifier);
      throw new UnauthorizedException('Too many attempts');
    }

    if (this.createHash(otp) !== entity.hash) {
      entity.attempts++;
      await this.otpRepo.save(purpose, identifier, entity);
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.otpRepo.delete(purpose, identifier);
  }
}
