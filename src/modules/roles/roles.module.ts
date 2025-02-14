import { Module } from '@nestjs/common';
import { RoleController } from './controllers/role.controller';
import { RolesService } from './services/roles.service';
import { RolesRepository } from './repositories/roles.repository';
import { RolePermissionRepository } from './repositories/role-permission.repository';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  controllers: [RoleController],
  providers: [RolesService, RolesRepository, RolePermissionRepository],
})
export class RolesModule {}
