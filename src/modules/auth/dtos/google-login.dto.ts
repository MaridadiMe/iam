import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google ID token from Android Sign-In' })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
