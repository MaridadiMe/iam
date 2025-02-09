import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { DataSource } from 'typeorm';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsRepository extends BaseRepository<Permission> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, Permission);
  }
}
