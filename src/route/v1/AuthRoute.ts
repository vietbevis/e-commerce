import express from 'express'
import asyncHandler from '@/middleware/asyncHandler'
import { validateRequest } from '@/middleware/validateRequest'
import { LoginSchema, RegisterSchema } from '@/validation/UserSchema'
import { AuthController } from '@/controller/AuthController'

const AuthRoute = express.Router()

AuthRoute.post('/register', validateRequest({ body: RegisterSchema }), asyncHandler(AuthController.register))
AuthRoute.post('/login', validateRequest({ body: LoginSchema }), asyncHandler(AuthController.login))

export default AuthRoute
