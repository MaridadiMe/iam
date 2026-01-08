import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { RolesModule } from '../roles/roles.module';
import { OtpModule } from '../otp/otp.module';
import { RestClientModule } from '../restclient/restclient.module';

@Module({
  imports: [RolesModule, OtpModule, RestClientModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
