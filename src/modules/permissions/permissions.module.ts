import { Module } from '@nestjs/common';
import { PermissionsController } from './controllers/permissions.controller';
import { PermissionsService } from './services/permissions.service';
import { PermissionsRepository } from './repositories/permissions.repository';

@Module({
  imports: [],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository],
  exports: [PermissionsRepository],
})
export class PermissionsModule {}
