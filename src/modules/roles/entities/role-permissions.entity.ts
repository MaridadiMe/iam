import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from 'src/modules/permissions/entities/permission.entity';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('role_permissions')
export class RolePermission extends BaseEntity {
  @ManyToOne(() => Role, (role) => role.permissions, { eager: false })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.roles, {
    eager: false,
  })
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;
}
