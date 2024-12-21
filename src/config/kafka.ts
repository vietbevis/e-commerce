import { Kafka, LogEntry, logLevel, Partitioners } from 'kafkajs'
import envConfig from '@/config/envConfig'
import { logError } from '@/utils/log'

export const KAFKA_CLIENT_ID = 'account-verification-service'
export const KAFKA_GROUP_ID = 'account-verification-group'

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: [envConfig.KAFKA_BROKER],
  retry: {
    initialRetryTime: 100,
    retries: 5
  },
  logLevel: logLevel.ERROR,
  logCreator:
    (_logLevel) =>
    ({ log }: LogEntry) => {
      logError(log.message)
    }
})

export const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
})
export const consumer = kafka.consumer({ groupId: KAFKA_GROUP_ID })
