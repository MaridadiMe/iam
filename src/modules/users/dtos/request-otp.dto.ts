import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { OtpPurpose } from 'src/modules/otp/enums/otp-purpose.enum';
import { User } from '../entities/user.entity';

export class RequestOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  purpose: OtpPurpose;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;
}
