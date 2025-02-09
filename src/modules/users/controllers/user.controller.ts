import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from 'src/common/controllers/base.controller';
import { User } from '../entities/user.entity';
import { UserService } from '../services/user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserResponseDto } from '../dtos/user-response.dto';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth-guard';
import { Permissions } from 'src/modules/auth/decorators/permissions.decorator';
import { PublicRoute } from 'src/modules/auth/decorators/public.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController extends BaseController<User> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Get()
  @HttpCode(200)
  @Permissions('VIEW_USERS')
  async findAllUsers(): Promise<BaseResponseDto<UserResponseDto[]>> {
    const users = await this.userService.findAllUsers();
    return new BaseResponseDto(users);
  }

  @Get(':id')
  @HttpCode(200)
  // @UseGuards(JwtAuthGuard)
  async findUserById(
    @Param('id') id: string,
  ): Promise<BaseResponseDto<UserResponseDto>> {
    const user = await this.userService.findUserById(id);
    return new BaseResponseDto(user);
  }

  @Post()
  @HttpCode(201)
  async createUser(
    @Body() dto: CreateUserDto,
  ): Promise<BaseResponseDto<UserResponseDto>> {
    const user = await this.userService.createUser(dto);
    return new BaseResponseDto(user, HttpStatus.CREATED);
  }
}
