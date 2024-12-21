import z from 'zod'
import { logError } from '@/utils/log'

const configSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  DOMAIN: z.string(),
  PROTOCOL: z.string(),
  PRODUCTION: z.enum(['true', 'false']).transform((val) => val === 'true'),
  PRODUCTION_URL: z.string(),
  // GOOGLE_CLIENT_ID: z.string(),
  // GOOGLE_CLIENT_SECRET: z.string(),
  // GOOGLE_REDIRECT_URIS: z.string(),
  CLIENT_URL: z.string(),
  REDIRECT_CLIENT_URI: z.string(),
  LIMIT_FILES: z.coerce.number().default(5),
  LIMIT_FILE_SIZE: z.coerce.number().default(5),
  MINIO_HOST: z.string(),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_ACCESSKEY: z.string(),
  MINIO_SECRETKEY: z.string(),
  TOKEN_VERIFY_EMAIL_SECRET: z.string(),
  TOKEN_VERIFY_EMAIL_EXPIRES_IN: z.string(),
  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number().default(465),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string(),
  KAFKA_BROKER: z.string()
})

const configServer = configSchema.safeParse(process.env)

if (!configServer.success) {
  logError('Environment variables validation failed:')
  logError(configServer.error.issues.map((item) => item.path[0] + ': ' + item.message).join('\n'))
  throw new Error('Invalid environment variables')
}

const envConfig = configServer.data
export const API_URL = envConfig.PRODUCTION
  ? envConfig.PRODUCTION_URL
  : `${envConfig.PROTOCOL}://${envConfig.DOMAIN}:${envConfig.PORT}`
export default envConfig

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof configSchema> {}
  }
}
