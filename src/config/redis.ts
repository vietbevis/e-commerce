import { Redis } from 'ioredis'
import envConfig from '@/config/envConfig'
import { logError, logInfo } from '@/utils/log'

let redisClient: Redis | null = null

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis({
      host: envConfig.REDIS_HOST,
      port: envConfig.REDIS_PORT,
      password: envConfig.REDIS_PASSWORD
    })

    redisClient.on('connect', () => {
      logInfo('[Redis] Connected successfully')
    })

    redisClient.on('error', (err) => {
      logError('[Redis Error]: ', err)
    })

    redisClient.on('connecting', () => {
      logInfo('[Redis] Connecting...')
    })
  }
  return redisClient
}
