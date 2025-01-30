import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RequestPasswordChangeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;
}
