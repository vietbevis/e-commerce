export const sessionKey = (...args: string[]) => {
  return `session:${args.join(':')}`
}
