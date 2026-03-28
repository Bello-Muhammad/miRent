import { Logger } from "@nestjs/common"

export default () => ({
    jwtSecret: process.env.JWT_SECRET || (() => { Logger.error('JWT_SECRET is required') })(),
    redisUrl: process.env.REDIS_URL || (() => { Logger.error('REDIS_URL is required') })()
})