import { AbstractModel } from '@/model/base/AbstractModel'
import { Column, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm'
import { TokenType } from '@/utils/types'
import { User } from '@/model/User'

@Entity('tbl_session')
export class Session extends AbstractModel {
  @Column({ type: 'text', name: 'access_token' })
  [TokenType.ACCESS_TOKEN]!: string;

  @Column({ type: 'text', name: 'refresh_token' })
  [TokenType.REFRESH_TOKEN]!: string

  @Column({ type: 'varchar', name: 'device_name' })
  deviceName!: string

  @Column({ type: 'varchar', name: 'device_type' })
  deviceType!: string

  @UpdateDateColumn({ name: 'last_login', type: 'timestamp' })
  lastLogin!: Date

  @Column({ type: 'boolean', name: 'is_revoked', default: false })
  isRevoked!: boolean

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User
}
