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
    const scopes = ['https://www.googleapis.com/auth/plus.me'];
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    res.redirect(url);
  }

  @Get('/google/callback')
  public async GoogleCallback(@QueryParam('code') code: object) {
    console.log(code);
    const { tokens } = await this.oauth2Client.getToken(code.code);
    this.oauth2Client.credentials = tokens;

    this.oauth2Client.on('tokens', data => {
      if (data.refresh_token) {
        console.log(data.refresh_token);
      }
      console.log(data.access_token);
    });

    const me = await google.plus('v1').people.get({ userId: 'me' });
    console.log(me.data);
  }
}
