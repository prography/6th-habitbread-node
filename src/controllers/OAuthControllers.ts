import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { google } from 'googleapis';
import { Get, JsonController, QueryParam, Res } from 'routing-controllers';
import { BaseController } from './BaseController';

@JsonController('/oauth')
export class OAuthControllers extends BaseController {
  private prisma: PrismaClient;
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  @Get('/google/login')
  public async GoogleOAuth(@Res() res: Response) {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    res.redirect(url);
    return res.end();
  }

  @Get('/google/callback')
  public async GoogleCallback(@QueryParam('code') code: string, @Res() res: Response) {
    console.log(`code: ${code}`);
    const { tokens } = await this.oauth2Client.getToken(code);
    console.log('getToken OK');
    this.oauth2Client.setCredentials(tokens);
    google.options({ auth: this.oauth2Client });
    console.log('setCredentials OK');
    const people = google.people({
      version: 'v1',
      auth: this.oauth2Client,
    });
    console.log('people OK');
    const me = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,photos',
    });

    console.log('Get DATA OK');
    console.log(me.data);
    return res.end();
  }
}
