export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    throttleTtl: Number(process.env.THROTTLE_TTL ?? 60000),
    throttleLimit: Number(process.env.THROTTLE_LIMIT ?? 120),
  },
});
