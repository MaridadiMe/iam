import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { Role } from '../entities/role.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RolePermission } from '../entities/role-permissions.entity';

@Injectable()
export class RolePermissionRepository extends BaseRepository<RolePermission> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, RolePermission);
  }
}
