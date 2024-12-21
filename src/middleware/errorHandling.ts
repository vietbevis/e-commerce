import { NextFunction, Request, Response } from 'express'
import { ReasonPhrases, StatusCodes } from 'http-status-codes'
import { formatDate } from '@/utils/helper'
import { ErrorResponse } from '@/core/ErrorResponse'
import { logError } from '@/utils/log'

const errorHandling = {
  endPointNotFound: (_req: Request, res: Response, _next: NextFunction) => {
    res.status(StatusCodes.NOT_FOUND).json({
      code: StatusCodes.NOT_FOUND,
      status: 'error',
      message: 'Endpoint not found.',
      timestamp: formatDate(new Date())
    })
  },
  globalError: (error: ErrorResponse, req: Request, res: Response, _next: NextFunction) => {
    logError('Error: ', error)
    const errorMessage = error.message || ReasonPhrases.INTERNAL_SERVER_ERROR
    let statusCode = StatusCodes.INTERNAL_SERVER_ERROR

    if (error.status) {
      statusCode = error.status
    } else if (error.name === 'MulterError') {
      statusCode = StatusCodes.BAD_REQUEST
    }

    const errors = error.errors || undefined
    res.status(statusCode).json({
      code: statusCode,
      status: 'error',
      message: errorMessage,
      errors,
      timestamp: formatDate(new Date())
    })
  }
}

export default errorHandling
