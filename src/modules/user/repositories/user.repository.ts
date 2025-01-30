import { BaseRepository } from 'src/common/repositories/base.repository';
import { User } from '../entities/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class UserRepository extends BaseRepository<User> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, User);
  }
}
