import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { OtpPurpose } from 'src/modules/otp/enums/otp-purpose.enum';

export class VerifyOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  purpose: OtpPurpose;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  otp: string;
}
