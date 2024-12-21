import nodemailer from 'nodemailer'
import envConfig from '@/config/envConfig'

export const transporter = nodemailer.createTransport({
  secure: true,
  host: envConfig.MAIL_HOST,
  port: envConfig.MAIL_PORT,
  auth: {
    user: envConfig.MAIL_USER,
    pass: envConfig.MAIL_PASS
  }
})
