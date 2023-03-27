export default (): any => ({
  port: parseInt(process.env.PORT) || 3000,
  mongodb: process.env.MONGODB_URL,
  rabbitMq: process.env.RABBITMQ_URL,
  globalPrefix: 'api',
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
  },
  throttle: {
    ttl: process.env.THROTTLER_TTL || 60,
    limit: process.env.THROTTLER_LIMIT || 10,
  },
});
