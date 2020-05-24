import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { google } from 'googleapis';
import { Get, JsonController, QueryParams, Res } from 'routing-controllers';
import { BaseController } from './BaseController';

@JsonController('/oauth')
export class OAuthControllers extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  @Get('/google/login')
  public async GoogleOAuth(@Res() res: Response) {
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
    res.redirect(url);
  }

  @Get('/google/callback')
  public async GoogleCallback(@QueryParams() qr: any) {
    console.log(qr);
  }
}
