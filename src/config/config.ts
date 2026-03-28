export default () => ({
    jwtSecret: process.env.JWT_SECRET,
    redisUrl: process.env.REDIS_URL
})