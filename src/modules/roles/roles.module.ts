import { Module } from '@nestjs/common';
import { RoleController } from './controllers/role.controller';
import { RolesService } from './services/roles.service';
import { RolesRepository } from './repositories/roles.repository';

@Module({
  controllers: [RoleController],
  providers: [RolesService, RolesRepository],
})
export class RolesModule {}
