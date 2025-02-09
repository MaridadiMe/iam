import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repositories/base.repository';
import { Role } from '../entities/role.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class RolesRepository extends BaseRepository<Role> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, Role);
  }
}
