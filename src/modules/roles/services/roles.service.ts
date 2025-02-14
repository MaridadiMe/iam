import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { Role } from '../entities/role.entity';
import { RolesRepository } from '../repositories/roles.repository';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { FindOneOptions } from 'typeorm';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { RolePermissionRepository } from '../repositories/role-permission.repository';
import { PermissionsRepository } from 'src/modules/permissions/repositories/permissions.repository';
import { AddPermissionToRoleDto } from '../dtos/add-permission-to-role.dto';
import { RolePermission } from '../entities/role-permissions.entity';

@Injectable()
export class RolesService extends BaseService<Role> {
  private readonly logger = new Logger(RolesService.name);
  constructor(
    protected readonly repository: RolesRepository,
    private readonly rolePermissionRepository: RolePermissionRepository,
    private readonly permissionRepository: PermissionsRepository,
  ) {
    super(repository);
  }

  async createRole(dto: CreateRoleDto, user: User): Promise<Role> {
    let exists: boolean;
    try {
      exists = await this.repository.exists({
        where: { name: dto.name.toUpperCase() },
      });
    } catch (error) {
      this.logger.error(`Error While Creating Role: ${error}`);
      throw new InternalServerErrorException(`Error While Creating Role`);
    }

    if (exists) {
      throw new UnprocessableEntityException(`Role Already Exists`);
    }

    try {
      const createdBy = user.userName ?? 'SYSTEM';
      const updatedBy = createdBy;
      dto.name = dto.name.toUpperCase();
      return await super.create({ ...dto, createdBy, updatedBy });
    } catch (error) {
      this.logger.error(`Error While Creating Role: ${error}`);
      throw new InternalServerErrorException(`Error While Creating Role`);
    }
  }

  async findRoleById(
    id: string,
    loadPermissions: boolean,
    user: User,
  ): Promise<Role> {
    try {
      const options: FindOneOptions<Role> = {
        where: { id },
        relations: loadPermissions
          ? ['permissions', 'permissions.permission']
          : [],
      };
      const role = await this.repository.findOne(options);

      if (!role) {
        throw new NotFoundException(`Role Not Found`);
      }

      if (loadPermissions) {
        const perm = role.permissions.map(
          (rolePermission: RolePermission) => rolePermission.permission,
        );
        role.permissions = perm as unknown as RolePermission[];
      }

      return role;
    } catch (error) {
      this.logger.error(`Error While Finding Role: ${error}`);
      throw new InternalServerErrorException(`Error While Finding Role`);
    }
  }

  async addPermissionToRole(
    roleId: string,
    dto: AddPermissionToRoleDto,
    user: User,
  ) {
    let role: Role;
    try {
      role = await this.repository.findOne({ where: { id: roleId } });
    } catch (error) {
      this.logger.error(`Error While Finding Role: ${error}`);
      throw new InternalServerErrorException(`Error While Finding Role`);
    }

    if (!role) {
      throw new NotFoundException(`Role Not Found`);
    }

    let permission: Permission;
    try {
      permission = await this.permissionRepository.findOne({
        where: { id: dto.permissionId },
      });
    } catch (error) {
      this.logger.error(`Error While Finding Permission: ${error}`);
      throw new InternalServerErrorException(`Error While Finding Role`);
    }

    if (!permission) {
      throw new NotFoundException(`Permission Not Found`);
    }

    try {
      const exists = await this.rolePermissionRepository.exists({
        where: { role, permission },
      });
      if (exists) {
        return this.findRoleById(roleId, true, user);
      }
    } catch (error) {
      this.logger.error(`Error While Adding Permission To Role: ${error}`);
      throw new InternalServerErrorException(
        'Error While Adding Permission To Role',
      );
    }

    try {
      await this.rolePermissionRepository.save({
        role,
        permission,
      });

      return this.findRoleById(roleId, true, user);
    } catch (error) {
      this.logger.error(`Error While Adding Permission To Role: ${error}`);
      throw new InternalServerErrorException(
        'Error While Adding Permission To Role',
      );
    }
  }
}
