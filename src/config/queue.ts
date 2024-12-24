import { QueueOptions, WorkerOptions } from 'bullmq'
import ms from 'ms'
import { getRedisClient } from '@/config/redis'

const connection = getRedisClient()
export const workerOptions: WorkerOptions = {
  connection,
  concurrency: 10,
  removeOnComplete: {
    age: ms('1d') / 1000,
    count: 1000
  },
  runRetryDelay: 1000,
  limiter: {
    max: 1000,
    duration: 1000
  }
}

export const queueOptions: QueueOptions = {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false
  }
}
