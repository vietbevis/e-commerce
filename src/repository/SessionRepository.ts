import { Session } from '@/model/Session'
import { AppDataSource } from '@/config/database'

export const SessionRepository = AppDataSource.getRepository(Session).extend({
  async upsertByUserIdAndDevice(
    userId: string,
    deviceName: string,
    deviceType: string,
    accessToken: string,
    refreshToken: string
  ) {
    let session = await this.findOne({ where: { user: { id: userId }, deviceName, deviceType } })

    // If the session already exists, update the tokens
    if (session) {
      session.accessToken = accessToken
      session.refreshToken = refreshToken
      return this.save(session)
    }

    // Otherwise, create a new session
    session = this.create({
      user: { id: userId },
      deviceName,
      deviceType,
      accessToken,
      refreshToken
    })

    return this.save(session)
  }
})
