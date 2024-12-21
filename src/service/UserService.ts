import { User } from '@/model/User'
import { UserRepository } from '@/repository/UserRepository'

export const UserService = {
  createUser: async (user: User) => {
    return UserRepository.save(user)
  }
}
