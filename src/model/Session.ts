import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm'
import { User } from '@/model/User'

@Entity('tbl_session')
export class Session extends AbstractModel {
  @Column({ type: 'varchar', name: 'device_name' })
  deviceName!: string

  @Column({ type: 'varchar', name: 'device_type' })
  deviceType!: string

  @UpdateDateColumn({ name: 'last_login', type: 'timestamp' })
  lastLogin!: Date

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt!: Date

  @Column({ type: 'boolean', name: 'is_revoked', default: false })
  isRevoked!: boolean

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User
}
