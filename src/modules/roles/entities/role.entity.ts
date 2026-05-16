import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { RolePermission } from './role-permissions.entity';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @Column()
  name: string;

  @Column({ default: false })
  isDefault: boolean;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  permissions: RolePermission[];
}
