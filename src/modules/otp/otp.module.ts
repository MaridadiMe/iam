import { Module } from '@nestjs/common';
import { OtpRepository } from './repositories/otp.repository';
import { OtpService } from './services/otp.service';

@Module({
  imports: [],
  providers: [OtpRepository, OtpService],
  exports: [OtpService],
})
export class OtpModule {}
