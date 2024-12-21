import { getRedisClient } from '@/config/redis'

const redisClient = getRedisClient()
const RedisRepository = {
  set: async (key: string, value: string, expirationInSeconds?: number): Promise<void> => {
    if (expirationInSeconds) {
      await redisClient.setex(key, expirationInSeconds, value)
    } else {
      await redisClient.set(key, value)
    }
  },

  get: async (key: string): Promise<string | null> => {
    return redisClient.get(key)
  },

  delete: async (key: string): Promise<number> => {
    return redisClient.del(key)
  },

  /**
   * Time To Live (Thời gian sống còn lại của 1 key)
   * @param key
   */
  ttl: async (key: string): Promise<number> => {
    return redisClient.ttl(key)
  }
}

export default RedisRepository
