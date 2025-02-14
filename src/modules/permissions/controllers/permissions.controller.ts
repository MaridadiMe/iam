import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { PermissionsService } from '../services/permissions.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/modules/auth/decorators/permissions.decorator';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { AuthenticatedUser } from 'src/modules/auth/decorators/authenticated-user.decorator';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { Permission } from '../entities/permission.entity';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly service: PermissionsService) {}

  @Post()
  @HttpCode(201)
  @Permissions('CREATE_PERMISSIONS')
  async createPermissions(
    @Body() dto: CreatePermissionDto,
    @AuthenticatedUser() user: User,
  ): Promise<BaseResponseDto<Permission>> {
    const permission = await this.service.createPermission(dto, user);
    return new BaseResponseDto(permission, HttpStatus.CREATED);
  }

  @Get()
  @HttpCode(200)
  // @Permissions('VIEW_PERMISSIONS')
  async getPermissions(): Promise<BaseResponseDto<Permissions[]>> {
    const permissions = await this.service.findAll();
    return new BaseResponseDto(permissions);
  }
}
