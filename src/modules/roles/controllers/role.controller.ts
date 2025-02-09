import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/controllers/base.controller';
import { Role } from '../entities/role.entity';
import { RolesService } from '../services/roles.service';
import { Permissions } from 'src/modules/auth/decorators/permissions.decorator';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { PublicRoute } from 'src/modules/auth/decorators/public.decorator';
import { AuthenticatedUser } from 'src/modules/auth/decorators/authenticated-user.decorator';
import { User } from 'src/modules/users/entities/user.entity';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

@Controller('roles')
@ApiBearerAuth()
@ApiTags('Roles')
export class RoleController {
  constructor(private readonly service: RolesService) {}

  @Post()
  @HttpCode(201)
  @Permissions('CREATE_ROLES')
  async createRoles(
    @Body() dto: CreateRoleDto,
    @AuthenticatedUser() user: User,
  ): Promise<BaseResponseDto<Role>> {
    const role = await this.service.createRole(dto, user);
    return new BaseResponseDto(role, HttpStatus.CREATED);
  }

  @Get()
  @HttpCode(200)
  @Permissions('VIEW_ROLES')
  async getRoles(): Promise<BaseResponseDto<Role[]>> {
    const roles = await this.service.findAll();
    return new BaseResponseDto(roles);
  }
}
