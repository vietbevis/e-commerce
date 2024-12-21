import { Column, Entity, OneToMany } from 'typeorm'
import { AbstractModel } from '@/model/base/AbstractModel'
import { ERole, UserStatus } from '@/utils/types'
import { compare } from 'bcryptjs'
import { Session } from '@/model/Session'

@Entity('tbl_user')
export class User extends AbstractModel {
  @Column({ name: 'full_name', type: 'nvarchar', length: 50 })
  fullName!: string

  @Column({ name: 'email', type: 'varchar', length: 100, unique: true })
  email!: string

  @Column({ name: 'password', type: 'varchar', length: 100 })
  password!: string

  @Column({ type: 'varchar', name: 'username', length: 70, unique: true })
  username!: string

  @Column({ type: 'varchar', name: 'provider_id', default: '' })
  providerId!: string

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.NOT_VERIFIED })
  status!: UserStatus

  @Column({ name: 'role', type: 'enum', enum: ERole, default: ERole.ROLE_USER })
  role!: ERole

  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  sessions!: Session[]

  async comparePassword(password: string) {
    return compare(password, this.password)
  }
}
