// repositories/otp.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { OtpPurpose } from '../enums/otp-purpose.enum';
import { OtpEntity } from '../entities/otp.entity';

@Injectable()
export class OtpRepository {
  private readonly TTL_SECONDS = 300;

  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  private getKey(purpose: OtpPurpose, identifier: string): string {
    return `otp:${purpose}:${identifier}`;
  }

  async save(
    purpose: OtpPurpose,
    identifier: string,
    entity: OtpEntity,
  ): Promise<void> {
    const key = this.getKey(purpose, identifier);

    await this.redis.set(key, JSON.stringify(entity), 'EX', this.TTL_SECONDS);
  }

  async find(
    purpose: OtpPurpose,
    identifier: string,
  ): Promise<OtpEntity | null> {
    const key = this.getKey(purpose, identifier);
    const data = await this.redis.get(key);

    return data ? JSON.parse(data) : null;
  }

  async delete(purpose: OtpPurpose, identifier: string): Promise<void> {
    await this.redis.del(this.getKey(purpose, identifier));
  }

  async ttl(purpose: OtpPurpose, identifier: string): Promise<number> {
    return this.redis.ttl(this.getKey(purpose, identifier));
  }
}
