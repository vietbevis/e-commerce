import { AppDataSource } from '@/config/database'
import { User } from '@/model/User'
import { UserStatus } from '@/utils/types'
import { BadRequestError } from '@/core/ErrorResponse'
import { MESSAGES } from '@/utils/message'

export const UserRepository = AppDataSource.getRepository(User).extend({
  async findByEmail(email: string) {
    return this.findOneBy({ email })
  },
  async findByUsername(username: string) {
    return this.findOneBy({ username })
  },
  async changeStatus(email: string, status: UserStatus) {
    const userExisting = await this.findByEmail(email)
    if (!userExisting) throw new BadRequestError(MESSAGES.ACCOUNT_NOT_FOUND)
    userExisting.status = status
    return this.save(userExisting)
  },
  async findByEmailAndStatus(email: string, status: UserStatus) {
    return this.findOneBy({ email, status })
  }
})
