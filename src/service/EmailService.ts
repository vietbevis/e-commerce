import fs from 'fs'
import path from 'path'
import envConfig, { API_URL } from '@/config/envConfig'
import { logError, logInfo } from '@/utils/log'
import { transporter } from '@/config/email'

const MAX_RETRIES: number = 3
export const EmailService = {
  emailTemplate: fs.readFileSync(path.resolve(__dirname, '..', '..', 'verify-email.html'), 'utf8'),

  sendMail: async (email: string, token: string, retryCount = 0): Promise<boolean> => {
    const maxRetries = MAX_RETRIES
    const verificationLink = `${API_URL}/api/v1/auth/verify/${token}`
    let emailTemplate = EmailService.emailTemplate
    emailTemplate = emailTemplate.replace(/{{action_url}}/g, verificationLink)

    try {
      await transporter.sendMail({
        from: `No Reply <${envConfig.MAIL_USER}>`,
        to: email,
        subject: 'Verify Your Account',
        html: emailTemplate
      })
      logInfo('Email sent successfully to ' + email)
      return true
    } catch (error) {
      logError(`Error sending email(${email}): ${error}`)

      if (retryCount < maxRetries - 1) {
        logInfo(`Retrying to send email to ${email}. Attempt ${retryCount + 2} of ${maxRetries}`)
        return EmailService.sendMail(email, token, retryCount + 1)
      } else {
        logError(`Failed to send email to ${email} after ${maxRetries} attempts`)
        return false
      }
    }
  }
}