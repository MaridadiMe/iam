import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
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
import { AddPermissionToRoleDto } from '../dtos/add-permission-to-role.dto';

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

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  // @Permissions('VIEW_ROLES')
  async viewRole(
    @AuthenticatedUser() user: User,
    @Param('id') id: string,
    @Query('loadPermissions') loadPermissions: boolean = false,
  ): Promise<BaseResponseDto<Role>> {
    const role = await this.service.findRoleById(id, loadPermissions, user);
    return new BaseResponseDto(role);
  }

  @Get()
  @HttpCode(200)
  // @Permissions('VIEW_ROLES')
  async getRoles(): Promise<BaseResponseDto<Role[]>> {
    const roles = await this.service.findAll();
    return new BaseResponseDto(roles);
  }

  @Post(':id/permissions')
  @HttpCode(201)
  // @Permissions('ASSIGN_PERMISSIONS')
  async addPermissionToRole(
    @Param('id') id: string,
    @Body() payload: AddPermissionToRoleDto,
    @AuthenticatedUser() user: User,
  ): Promise<BaseResponseDto<Role>> {
    const role = await this.service.addPermissionToRole(id, payload, user);
    return new BaseResponseDto(role, HttpStatus.CREATED);
  }
}
