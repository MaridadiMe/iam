import { User } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  permissions: string[];

  constructor(user: User) {
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.phone = user.phone;
    this.email = user.email;
    this.userName = user.userName;
    this.permissions = user.permissions;
  }
}
