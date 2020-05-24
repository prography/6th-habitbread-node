/*import dotenv from 'dotenv';
import { google } from 'googleapis';
import supertest from 'supertest';
import app from '../../src/app';
dotenv.config({ path: `${__dirname}/../../.env.test` });

describe('testHabit', () => {
  const testClient = supertest(app);

  // GET createToken
  test('createToken', async () => {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );
    const scopes = ['https://www.googleapis.com/auth/plus.me'];
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  });
});*/
