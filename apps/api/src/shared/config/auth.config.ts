export default () => ({
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
    refreshCookieName: process.env.REFRESH_COOKIE_NAME ?? 'kolos_refresh',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    cookieSameSite: (process.env.COOKIE_SAME_SITE ?? 'lax') as
      | 'lax'
      | 'strict'
      | 'none',
    adminSeedEmail: process.env.ADMIN_SEED_EMAIL ?? 'admin@example.com',
    adminSeedPassword: process.env.ADMIN_SEED_PASSWORD ?? 'Admin1234!',
  },
});
