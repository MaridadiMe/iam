import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { Role } from '../entities/role.entity';
import { RolesRepository } from '../repositories/roles.repository';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { User } from 'src/modules/users/entities/user.entity';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';

@Injectable()
export class RolesService extends BaseService<Role> {
  private readonly logger = new Logger(RolesService.name);
  constructor(protected readonly repository: RolesRepository) {
    super(repository);
  }

  async createRole(dto: CreateRoleDto, user: User): Promise<Role> {
    let exists: boolean;
    try {
      exists = await this.repository.exists({
        where: { name: dto.name.toUpperCase() },
      });
    } catch (error) {}

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
}
