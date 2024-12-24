import { consumer, producer } from '@/config/kafka'
import { EmailService } from '@/service/EmailService'
import RedisService from '@/service/RedisService'
import { logError, logInfo } from '@/utils/log'
import { deleteUnverifiedUserQueueKey, verificationKey } from '@/utils/keyRedis'
import { accountQueue } from '@/queue/AccountWorker'
import ms from 'ms'

export type UserData = {
  email: string
  verificationToken: string
}

export const TOPIC_NAME = 'account-verification'
export const FAILED_EMAILS_TOPIC = 'failed-account-verifications'
const TIME_TO_LIVE = ms('1m') // 5 phút

export const KafkaService = {
  initializeKafka: async () => {
    await producer.connect()
    await consumer.connect()
    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: false })

    await consumer.run({
      eachMessage: async ({ message }) => {
        const { email, verificationToken } = JSON.parse(message.value?.toString() || '{}') as UserData
        const emailSent = await EmailService.sendMail(email, verificationToken)

        if (emailSent) {
          const queueKey = deleteUnverifiedUserQueueKey(email)
          const QUEUE_NAME = 'delete-unverified-user'
          await accountQueue.remove(queueKey)
          await Promise.all([
            RedisService.setCacheItem(verificationKey(email), verificationToken, TIME_TO_LIVE / 1000),
            accountQueue.add(QUEUE_NAME, email, { delay: TIME_TO_LIVE, jobId: queueKey })
          ])

          logInfo(`Verification email sent and token cached for ${email}`)
        } else {
          // If email sending fails after all retries, send to a separate topic for further processing
          await KafkaService.sendFailedEmailMessage({ email, verificationToken })
          logError(`Failed to send verification email to ${email} after all retries`)
        }
      }
    })
  },

  sendMailMessageToKafka: async (email: string, verificationToken: string) => {
    await producer.send({
      topic: TOPIC_NAME,
      messages: [{ value: JSON.stringify({ email, verificationToken }) }]
    })
  },

  sendFailedEmailMessage: async (userData: UserData) => {
    await producer.send({
      topic: FAILED_EMAILS_TOPIC,
      messages: [{ value: JSON.stringify(userData) }]
    })
  }
}
