import { AppleAuthConfig } from 'apple-auth';
import dotenv from 'dotenv';

// '.env' File Loading
dotenv.config();

const NODE_ENV: string = process.env.NODE_ENV || 'dev';

if (NODE_ENV === 'prod') {
  dotenv.config({ path: `${__dirname}/../../.env.prod` });
} else if (NODE_ENV === 'dev') {
  dotenv.config({ path: `${__dirname}/../../.env.dev` });
}

// Apple Config
const appleConfig = {
  client_id: process.env.APPLE_CLIENT_ID,
  team_id: process.env.APPLE_TEAM_ID,
  key_id: process.env.APPLE_KEY_ID,
  redirect_uri: process.env.APPLE_REDIRECT_URI,
  scope: process.env.APPLE_SCOPE,
} as AppleAuthConfig;

// ENV Module
export default {
  NODE_ENV: process.env.NODE_ENV,
  PORT: Number(process.env.PORT),
  PASSWORD_SECRET: process.env.PASSWORD_SECRET,
  APPLE: appleConfig,
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL,
  },
};
