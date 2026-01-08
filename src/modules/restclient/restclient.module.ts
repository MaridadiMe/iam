import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { RestclientService } from './restclient.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [RestclientService],
  exports: [RestclientService],
})
export class RestClientModule {}
