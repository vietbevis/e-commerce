import 'reflect-metadata'

import app from '@/app'
import envConfig from '@/config/envConfig'
import { AppDataSource } from '@/config/database'
import { initFolder } from '@/utils/helper'
import { logError, logInfo } from '@/utils/log'
import { KafkaService } from '@/service/KafkaService'

const PORT = envConfig.PORT

;(async () => {
  try {
    await AppDataSource.initialize()
    logInfo('Database Connected')
    initFolder()

    await KafkaService.initializeKafka()
    logInfo('Kafka Connected')

    app.listen(PORT, () => {
      logInfo('Server is running on port ' + PORT)
    })
  } catch (error: any) {
    logError('Internal Server Error: ', error)
  }
})()
