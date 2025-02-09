import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { PermissionsRepository } from '../repositories/permissions.repository';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dtos/create-permission.dto';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class PermissionsService extends BaseService<Permission> {
  private readonly logger = new Logger(PermissionsService.name);
  constructor(repository: PermissionsRepository) {
    super(repository);
  }

  async createPermission(
    dto: CreatePermissionDto,
    user: User,
  ): Promise<Permission> {
    let exists: boolean;
    try {
      exists = await this.repository.exists({
        where: { name: dto.name.toUpperCase() },
      });
    } catch (error) {}

    if (exists) {
      throw new UnprocessableEntityException(`Permission Already Exists`);
    }

    try {
      const createdBy = user.userName ?? 'SYSTEM';
      const updatedBy = createdBy;
      dto.name = dto.name.toUpperCase();
      return await super.create({ ...dto, createdBy, updatedBy });
    } catch (error) {
      this.logger.error(`Error While Creating Permission: ${error}`);
      throw new InternalServerErrorException(`Error While Creating Permission`);
    }
  }
}
