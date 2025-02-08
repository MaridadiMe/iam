import { BaseEntity } from 'src/common/entities/base.entity';
import { RolePermission } from 'src/modules/roles/entities/role-permissions.entity';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity({ name: 'permissions' })
export class Permission extends BaseEntity {
  @Column()
  name: string;

  @ManyToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  roles: RolePermission[];
}
