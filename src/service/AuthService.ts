import { LoginBodyType, RegisterBodyType } from '@/validation/UserSchema'
import { UserRepository } from '@/repository/UserRepository'
import { BadRequestError, UnauthorizedError } from '@/core/ErrorResponse'
import { getDeviceInfo, getUsername, hashPassword } from '@/utils/helper'
import { LoginResponseType, TokenType, UserStatus } from '@/utils/types'
import { User } from '@/model/User'
import { Request } from 'express'
import { MESSAGES } from '@/utils/message'
import { logInfo } from '@/utils/log'
import { JwtService } from '@/service/JwtService'
import { SessionRepository } from '@/repository/SessionRepository'
import RedisService from '@/service/RedisService'
import { sessionKey, verificationKey } from '@/utils/keyRedis'
import envConfig from '@/config/envConfig'
import ms from 'ms'
import { KafkaService } from '@/service/KafkaService'

export const AuthService = {
  register: async (body: RegisterBodyType): Promise<boolean> => {
    logInfo('Registering a new user')
    // Check if the email is already registered
    const userExisting = await UserRepository.findByEmail(body.email)
    if (userExisting) throw new BadRequestError(MESSAGES.USER_ALREADY_EXISTS)

    // Generate a unique username
    const username = getUsername(body.fullName)

    // Hash the password
    const pwdHash = await hashPassword(body.password)

    // Create a new user
    const newUser = UserRepository.create({
      fullName: body.fullName,
      email: body.email,
      password: pwdHash,
      username,
      status: UserStatus.NOT_VERIFIED
    })

    // Save the user
    await UserRepository.save(newUser)

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()
    await KafkaService.sendMailMessageToKafka(newUser.email, verificationToken)

    logInfo('User created successfully: ' + newUser.email)
    return true
  },

  validateUser: async (email: string, password: string): Promise<User> => {
    logInfo('Validating the user')
    // Find the user by email
    const user = await UserRepository.findByEmail(email)
    if (!user) throw new UnauthorizedError(MESSAGES.EMAIL_OR_PASSWORD_INCORRECT)

    // Compare the password
    const isPasswordMatch = await user.comparePassword(password)
    if (!isPasswordMatch) throw new UnauthorizedError(MESSAGES.EMAIL_OR_PASSWORD_INCORRECT)

    // Check the user status
    if (user.status === UserStatus.NOT_VERIFIED) throw new UnauthorizedError(MESSAGES.ACCOUNT_NOT_ACTIVE)
    if (user.status === UserStatus.BLOCKED) throw new UnauthorizedError(MESSAGES.ACCOUNT_BLOCKED)
    if (user.status === UserStatus.DELETED) throw new UnauthorizedError(MESSAGES.ACCOUNT_DELETED)

    logInfo('User validated successfully: ' + email)
    return user
  },

  saveSession: async (
    user: User,
    deviceName: string,
    deviceType: string,
    accessToken: string,
    refreshToken: string
  ): Promise<void> => {
    // Save session to redis
    await Promise.all([
      SessionRepository.findByUserIdAndDeviceOrCreate(user.id, deviceName, deviceType),
      RedisService.setCacheItem(
        sessionKey(user.id, deviceName, deviceType, TokenType.ACCESS_TOKEN),
        accessToken,
        ms(envConfig.ACCESS_TOKEN_EXPIRES_IN) / 1000
      ),
      RedisService.setCacheItem(
        sessionKey(user.id, deviceName, deviceType, TokenType.REFRESH_TOKEN),
        refreshToken,
        ms(envConfig.REFRESH_TOKEN_EXPIRES_IN) / 1000
      )
    ])
  },

  login: async (body: LoginBodyType, req: Request): Promise<LoginResponseType> => {
    // Validate the user
    const user = await AuthService.validateUser(body.email, body.password)

    // Generate the token
    const [accessToken, refreshToken] = await Promise.all([
      JwtService.generateToken(user, TokenType.ACCESS_TOKEN),
      JwtService.generateToken(user, TokenType.REFRESH_TOKEN)
    ])

    // Log the device info
    const { deviceName, deviceType } = getDeviceInfo(req)

    // Save session to redis
    await AuthService.saveSession(user, deviceName, deviceType, accessToken, refreshToken)

    logInfo('User logged in successfully: ' + user.email)

    return {
      [TokenType.ACCESS_TOKEN]: accessToken,
      [TokenType.REFRESH_TOKEN]: refreshToken
    }
  },

  verifyAccount: async (email: string, token: string): Promise<boolean> => {
    const tokenCached = await RedisService.getCacheItem(verificationKey(email))
    if (tokenCached !== token) throw new BadRequestError(MESSAGES.INVALID_VERIFICATION_TOKEN)

    await UserRepository.changeStatus(email, UserStatus.VERIFIED)

    logInfo('User account verified successfully: ' + email)
    return true
  }
}
