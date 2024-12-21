import express, { Express } from 'express'
import helmet from 'helmet'
import compression from 'compression'
import { OkResponse } from '@/core/SuccessResponse'
import errorHandling from '@/middleware/errorHandling'
import { morganMiddleware } from '@/utils/logger'
import { logInfo } from '@/utils/log'
import routes from '@/route'
import cookieParser from 'cookie-parser'

const app: Express = express()

app.use(morganMiddleware)

// TODO: config sau
app.use(helmet())
app.use(compression())

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

// Init route
routes(app)

app.get('/ping', (req, res) => {
  logInfo('PONG ' + req.user.id)
  new OkResponse('PONG').send(res)
})

// Handling errors
app.use(errorHandling.endPointNotFound)
app.use(errorHandling.globalError)

export default app
