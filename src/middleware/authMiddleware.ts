import { NextFunction, Request, Response } from 'express'
import { UnauthorizedError } from '@/core/ErrorResponse'
import { JwtService } from '@/service/JwtService'
import { TokenType } from '@/utils/types'
import { getDeviceInfo } from '@/utils/helper'
import RedisService from '@/service/RedisService'
import { sessionKey } from '@/utils/keyRedis'

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Extract JWT token from header
    const jwtToken = getJwtTokenFromHeaderOrCookies(req)

    // Verify JWT token
    const decoded = await JwtService.verifyToken(jwtToken, TokenType.ACCESS_TOKEN)

    // Get device info
    const { deviceName, deviceType } = getDeviceInfo(req)

    // Check token in redis
    const tokenInRedis = await RedisService.getCacheItem(
      sessionKey(decoded.payload.id, deviceName, deviceType, TokenType.ACCESS_TOKEN)
    )

    // If token in redis is not equal to the token in the header, throw an error
    if (tokenInRedis !== jwtToken) {
      throw new UnauthorizedError('Token is invalid (not equal to the token in redis)')
    }

    // Set user to req.user
    req.user = {
      ...decoded.payload,
      email: decoded.sub
    }

    next()
  } catch (_e) {
    next(new UnauthorizedError('Token is invalid'))
  }
}

const getJwtTokenFromHeaderOrCookies = (req: Request): string => {
  const authHeader = req.headers.authorization
  const authCookie = req.cookies?.[TokenType.ACCESS_TOKEN]

  // Kiểm tra nếu cả hai đều không tồn tại
  if (!authHeader && !authCookie) {
    throw new UnauthorizedError('No token provided')
  }

  // Lấy token từ header nếu có
  if (authHeader) {
    const tokenParts = authHeader.trim().split(' ')
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization header format')
    }
    return tokenParts[1]
  }

  // Lấy token từ cookie nếu có
  if (typeof authCookie !== 'string' || !authCookie.trim()) {
    throw new UnauthorizedError('Invalid token in cookies')
  }

  return authCookie
}
