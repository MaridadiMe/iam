import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddPermissionToRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  permissionId: string;
}
