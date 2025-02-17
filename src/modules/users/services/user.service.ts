import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { UserResponseDto } from '../dtos/user-response.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Role } from 'src/modules/roles/entities/role.entity';
import { RolesRepository } from 'src/modules/roles/repositories/roles.repository';

@Injectable()
export class UserService extends BaseService<User> {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rolesRepository: RolesRepository,
  ) {
    super(userRepository);
  }

  async findAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return users.map((user) => new UserResponseDto(user));
  }

  async findUserById(id: string): Promise<UserResponseDto> {
    let user: User;
    try {
      user = await this.userRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(`Error While Fetching User: ${error}`);
      throw new InternalServerErrorException(`Error Fetching User`);
    }

    if (!user) {
      throw new NotFoundException(`User Not Found`);
    }

    return new UserResponseDto(user);
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    let userExists: boolean = false;
    try {
      userExists = await this.userRepository.exists({
        where: { email: dto.email },
      });
    } catch (error) {
      this.logger.error(`Error Checking If User Exists: ${error}`);
      throw new InternalServerErrorException(`Error While Creating User`);
    }

    if (userExists) {
      throw new BadRequestException(`User With This Email Already Exists`);
    }

    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(dto.password, salt);
      const userName = `${dto.firstName[0]}${dto.lastName}`.toUpperCase();

      const user = this.userRepository.create({
        ...dto,
        password: hash,
        createdBy: 'SYSTEM',
        userName,
      });
      const savedUser = await this.userRepository.save(user);
      return new UserResponseDto(savedUser);
    } catch (error) {
      this.logger.error(`Error While Saving A User: ${error}`);
      throw new InternalServerErrorException(`Error While Creating User`);
    }
  }

  async validateUser(email: string, pass: string): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email: email,
          isActive: true,
        },
        relations: [
          'role',
          'role.permissions',
          'role.permissions.role',
          'role.permissions.permission',
        ],
      });

      if (!user) {
        return null;
      }
      if (!user.isActive) {
        this.logger.error('Attempted Login for Inactive User');
        return null;
      }
      const isMatch = await bcrypt.compare(pass, user.password);

      if (!isMatch) {
        this.logger.error(`Incorrect Password for User with ID: ${user.id}`);
        return null;
      }

      if (user.role) {
        const permissions =
          user.role?.permissions?.flatMap(
            (permission) => permission.permission.name,
          ) ?? [];
        user.permissions = permissions;
      }
      return new UserResponseDto(user);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async assignRoleToUser(id: string, roleId: string, user: User) {
    try {
      const role: Role = await this.rolesRepository.findOneBy({ id: roleId });
      const userFetched = await this.userRepository.findOneBy({ id });

      if (!role || !userFetched) {
        throw new Error(`Role: ${roleId} or User: ${id} Does Not Exist`);
      }

      userFetched.role = role;
      const savedUser = await this.userRepository.save(userFetched);
      this.logger.debug(JSON.stringify(savedUser));
      return new UserResponseDto(savedUser);
    } catch (error) {
      this.logger.error(`Error Assigning Role to User: ${error}`);
      throw new InternalServerErrorException(`Error Assigning Role to User`);
    }
  }
}
