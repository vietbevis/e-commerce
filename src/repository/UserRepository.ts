import { AppDataSource } from '@/config/database'
import { User } from '@/model/User'

export const UserRepository = AppDataSource.getRepository(User).extend({
  async findByEmail(email: string) {
    return this.findOneBy({ email })
  },
  async findByUsername(username: string) {
    return this.findOneBy({ username })
  }
})
