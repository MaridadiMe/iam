import { BaseEntity } from 'src/common/entities/base.entity';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { RolePermission } from './role-permissions.entity';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  permissions: RolePermission[];
}
