import RedisRepository from '@/repository/RedisRepository'

export const RedisService = {
  setCacheItem: async (key: string, value: string, expirationInSeconds?: number): Promise<void> => {
    await RedisRepository.set(key, value, expirationInSeconds)
  },

  setCacheItemWithLock: async (key: string, value: string, expirationInSeconds?: number): Promise<boolean> => {
    return await RedisRepository.setWithLock(key, value, expirationInSeconds)
  },

  getCacheItem: async (key: string): Promise<string | null> => {
    return await RedisRepository.get(key)
  },

  deleteCacheItem: async (key: string): Promise<boolean> => {
    const result = await RedisRepository.delete(key)
    return result > 0
  },

  /**
   * TTL (Thời gian sống còn lại của 1 key)
   * @param key
   */
  getCacheItemTTL: async (key: string): Promise<number> => {
    return await RedisRepository.ttl(key)
  }
}

export default RedisService
