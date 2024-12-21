import path from 'path'
import fs from 'fs'
import slugify from 'slugify'
import { randomUUID } from 'crypto'
import { cloneDeep, isArray, isObject, map, omit, reduce } from 'lodash'
import { hash } from 'bcryptjs'
import { ObjectLiteral } from 'typeorm'
import { logInfo } from '@/utils/log'
import { UAParser } from 'ua-parser-js'
import { Request } from 'express'

export const UPLOAD_TEMP_DIR = 'uploads'
export const UPLOAD_TEMP_DIR_OPTIMIZE = 'uploads/optimized'

export const initFolder = () => {
  const uploadFolderPath = path.resolve(UPLOAD_TEMP_DIR)
  const optimizeFolderPath = path.resolve(UPLOAD_TEMP_DIR_OPTIMIZE)
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, { recursive: true })
    logInfo('Created: ' + uploadFolderPath)
  }
  if (!fs.existsSync(optimizeFolderPath)) {
    fs.mkdirSync(optimizeFolderPath, { recursive: true })
    logInfo('Created: ' + optimizeFolderPath)
  }
}

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })
}

export const getUsername = (fullName: string) => {
  const arr = fullName.trim().split(' ')
  let newName = ''
  if (arr.length >= 2) {
    newName = arr[0].trim() + ' ' + arr[arr.length - 1].trim()
  } else {
    newName = arr[0].trim()
  }
  newName = newName.replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
  return newName + '_' + randomUUID().replace(/-/g, '').slice(0, 10)
}

export const getSlug = (str: string): string => {
  const newStr = slugify(str, {
    lower: true,
    strict: true,
    locale: 'vi'
  })
  return newStr + '-' + randomUUID().replace(/-/g, '')
}

export const omitFields = <T extends ObjectLiteral>(data: T, fields: string[] = []) => {
  const omitFieldsDefault = [
    'createdAt',
    'updatedAt',
    'password',
    'providerId',
    'roles',
    'privateKey',
    'publicKey',
    'status',
    ...fields
  ]

  const deepOmit = (obj: any): any => {
    if (isArray(obj)) {
      return map(obj, deepOmit)
    } else if (isObject(obj)) {
      const omittedObject = omit(obj, omitFieldsDefault)
      return reduce(
        omittedObject,
        (acc, value, key) => {
          acc[key] = isObject(value) ? deepOmit(value) : value
          return acc
        },
        {} as Record<string, any>
      )
    }
    return obj
  }

  return deepOmit(cloneDeep(data))
}

export const getDeviceInfo = (req: Request) => {
  const parser = new UAParser(req.headers['user-agent'])
  return {
    deviceName: parser.getUA() || 'Unknown',
    deviceType: getDeviceType(parser)
  }
}

export const getDeviceType = (parser: UAParser) => {
  return `${parser.getBrowser().name || 'Unknown'}-${parser.getBrowser().version || 'Unknown'}-${parser.getBrowser().major || 'Unknown'}`
}

const saltRounds = 10
export const hashPassword = async (password: string) => hash(password, saltRounds)
