import { Queue, Worker } from 'bullmq'
import { logInfo } from '@/utils/log'
import { UserRepository } from '@/repository/UserRepository'
import { UserStatus } from '@/utils/types'
import { queueOptions, workerOptions } from '@/config/queue'

const QUEUE_NAME = 'account-queue'

export const accountQueue = new Queue(QUEUE_NAME, queueOptions)

export const accountWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const email = job.data as string
    const user = await UserRepository.findByEmailAndStatus(email, UserStatus.NOT_VERIFIED)

    if (!user) {
      logInfo(`User ${email} not found or already verified`)
      return
    }

    await UserRepository.remove(user)
    logInfo(`Deleting unverified user ${email}`)
  },
  workerOptions
)
