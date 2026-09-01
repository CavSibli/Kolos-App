import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'staging', 'production')
    .required(),
  PORT: Joi.number().default(3000),

  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_SSL: Joi.string().valid('true', 'false').default('false'),

  MONGO_URI: Joi.string().required(),
  MONGO_DB_NAME: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('30d'),

  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  REFRESH_COOKIE_NAME: Joi.string().default('kolos_refresh'),
  COOKIE_SECURE: Joi.string().valid('true', 'false').default('false'),
  COOKIE_SAME_SITE: Joi.string()
    .valid('lax', 'strict', 'none')
    .default('lax'),

  ADMIN_SEED_EMAIL: Joi.string().email().default('admin@example.com'),
  ADMIN_SEED_PASSWORD: Joi.string().min(8).default('Admin1234!'),

  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(10),
});
