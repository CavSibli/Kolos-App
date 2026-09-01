import postgresConfig from './postgres.config';
import mongoConfig from './mongo.config';
import authConfig from './auth.config';
import appConfig from './app.config';

export default () => ({
  ...appConfig(),
  ...postgresConfig(),
  ...mongoConfig(),
  ...authConfig(),
});
