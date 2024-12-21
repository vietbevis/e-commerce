import { PayloadJwtToken } from '@/service/JwtService'

declare module 'express-serve-static-core' {
  interface Request {
    user: PayloadJwtToken & { email: string }
  }
}
