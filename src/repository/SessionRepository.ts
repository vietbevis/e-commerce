import { Session } from '@/model/Session'
import { AppDataSource } from '@/config/database'
import ms from 'ms'
import envConfig from '@/config/envConfig'

export const SessionRepository = AppDataSource.getRepository(Session).extend({
  async findByUserIdAndDeviceOrCreate(userId: string, deviceName: string, deviceType: string) {
    let session = await this.findOne({ where: { user: { id: userId }, deviceName, deviceType } })

    if (!session) {
      session = this.create({
        user: { id: userId },
        deviceName,
        deviceType
      })
    }

    session.expiresAt = new Date(Date.now() + ms(envConfig.REFRESH_TOKEN_EXPIRES_IN))

    return this.save(session)
  }
})
