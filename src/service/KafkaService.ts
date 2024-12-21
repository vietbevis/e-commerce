import { consumer, producer } from '@/config/kafka'
import { EmailService } from '@/service/EmailService'
import RedisService from '@/service/RedisService'
import { logError, logInfo } from '@/utils/log'

type UserData = {
  email: string
  verificationToken: string
}

export const TOPIC_NAME = 'account-verification'
export const FAILED_EMAILS_TOPIC = 'failed-account-verifications'

export const KafkaService = {
  initializeKafka: async () => {
    await producer.connect()
    await consumer.connect()
    await consumer.subscribe({ topic: TOPIC_NAME })

    await consumer.run({
      eachMessage: async ({ message }) => {
        const userData = JSON.parse(message.value?.toString() || '{}') as UserData
        const emailSent = await EmailService.sendMail(userData.email, userData.verificationToken)

        if (emailSent) {
          await RedisService.setCacheItem(userData.email, userData.verificationToken, 60 * 5)
          logInfo(`Verification email sent and token cached for ${userData.email}`)
        } else {
          // If email sending fails after all retries, send to a separate topic for further processing
          await KafkaService.sendFailedEmailMessage(userData)
          logError(`Failed to send verification email to ${userData.email} after all retries`)
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
