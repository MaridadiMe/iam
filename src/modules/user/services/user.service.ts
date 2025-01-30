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

@Injectable()
export class UserService extends BaseService<User> {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly userRepository: UserRepository) {
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

      const user = this.userRepository.create({
        ...dto,
        password: hash,
        createdBy: 'SYSTEM',
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
      const user = await this.userRepository.findOneBy({
        email: email,
        isActive: true,
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
      return new UserResponseDto(user);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
