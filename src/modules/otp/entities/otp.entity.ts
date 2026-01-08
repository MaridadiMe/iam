// entities/otp.entity.ts
export class OtpEntity {
  hash: string;
  attempts: number;
  expiresAt: number;
}
