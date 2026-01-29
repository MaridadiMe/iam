import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  RequestMethod,
} from '@nestjs/common';
import { BaseService } from 'src/common/services/base.service';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { UserResponseDto } from '../dtos/user-response.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { Role } from 'src/modules/roles/entities/role.entity';
import { RolesRepository } from 'src/modules/roles/repositories/roles.repository';
import { OtpService } from 'src/modules/otp/services/otp.service';
import { OtpPurpose } from 'src/modules/otp/enums/otp-purpose.enum';
import { formatPhoneNumber } from 'src/common/helpers/app-helpers';
import { RestclientService } from 'src/modules/restclient/restclient.service';
import { ConfigService } from '@nestjs/config';
import { RequestOtpDto } from '../dtos/request-otp.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';

@Injectable()
export class UserService extends BaseService<User> {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly otpService: OtpService,
    private readonly restClient: RestclientService,
    private readonly configService: ConfigService,
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
    const normalizedPhone = formatPhoneNumber(dto.phone);
    try {
      userExists = await this.userRepository.exists({
        where: [{ email: dto.email }, { phone: normalizedPhone }],
      });
    } catch (error) {
      this.logger.error(`Error Checking If User Exists: ${error}`);
      throw new InternalServerErrorException(`Error While Creating User`);
    }

    if (userExists) {
      throw new BadRequestException(
        `User With This Email/Phone Already Exists`,
      );
    }

    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(dto.password, salt);
      const userName = `${dto.firstName[0]}${dto.lastName}`.toUpperCase();

      const user = this.userRepository.create({
        ...dto,
        phone: normalizedPhone,
        password: hash,
        createdBy: 'SYSTEM',
        userName,
      });
      const savedUser = await this.userRepository.save(user);
      const otpDto: RequestOtpDto = {
        purpose: OtpPurpose.PHONE_VERIFICATION,
        userId: savedUser.id,
      };
      await this.requestOtp(otpDto);
      return new UserResponseDto(savedUser);
    } catch (error) {
      this.logger.error(`Error While Saving A User: ${error}`);
      throw new InternalServerErrorException(`Error While Creating User`);
    }
  }

  async requestOtp(dto: RequestOtpDto) {
    try {
      const user = await this.userRepository.findOneBy({ id: dto.userId });
      const { otp } = await this.otpService.requestOtp(
        dto.purpose,
        String(user.id),
      );
      const sendSmsPayload = {
        message: `Your OTP for RosemLabs is ${otp} for mobile ${user.phone}. Contact Us if you did not request the token.`,
        recipients: [user.phone],
      };
      const token = `Bearer ${this.configService.get('IAM_ACCESS_TOKEN')}`;
      const nseUrl = this.configService.get('NSE_BASE_URL');
      const nseSmsEndpoint = this.configService.get('NSE_SMS_ENDPOINT');
      await this.restClient.request({
        url: `${nseUrl}${nseSmsEndpoint}`,
        method: RequestMethod.POST,
        payload: sendSmsPayload,
        headers: { Authorization: token },
      });
    } catch (error) {
      this.logger.error('Error While Requesting OTP', error.message);
      return null;
    }
  }

  async confirmPhoneVerification(dto: VerifyOtpDto): Promise<string> {
    const { purpose, userId, otp } = dto;
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isPhoneVerified) {
      throw new BadRequestException('Phone already verified');
    }

    await this.otpService.verifyOtp(purpose, String(user.id), otp);

    user.isPhoneVerified = true;
    await this.userRepository.save(user);

    return 'Phone verified successfully';
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
