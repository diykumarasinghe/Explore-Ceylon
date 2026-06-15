import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'exploreceylonsupersecretkeyfordevelopmentpurposeonly12345!',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
}));
