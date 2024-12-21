import { AuthService } from '@/service/AuthService'
import { OkResponse } from '@/core/SuccessResponse'
import { Request, Response } from 'express'
import { JwtService } from '@/service/JwtService'
import { TokenType } from '@/utils/types'

export const AuthController = {
  async register(req: Request, res: Response) {
    await AuthService.register(req.body)
    new OkResponse('Registered successfully').send(res)
  },
  async login(req: Request, res: Response) {
    const result = await AuthService.login(req.body, req)
    JwtService.setTokenToCookie(res, result.accessToken, TokenType.ACCESS_TOKEN)
    JwtService.setTokenToCookie(res, result.refreshToken, TokenType.REFRESH_TOKEN)
    new OkResponse('Login successfully', result).send(res)
  }
}
