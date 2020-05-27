import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { google } from 'googleapis';
import { Get, HttpError, JsonController, QueryParam, Res } from 'routing-controllers';
import { InternalServerError } from '../exceptions/Exception';
import { AuthHelper } from '../middleware/AuthHelper';
import { BaseController } from './BaseController';

@JsonController('/oauth')
export class OAuthControllers extends BaseController {
  private prisma: PrismaClient;
  private oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );
  private parseResponse = (data: any) => {
    return {
      name: data.names.length ? data.names[0].displayName : '습관이',
      email: data.emailAddresses.length ? data.emailAddresses[0].value : 'example@mail.com',
      imageUrl: data.photos.length ? data.photos[0].url : null,
    };
  };

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
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      google.options({ auth: this.oauth2Client });

      const people = google.people({
        version: 'v1',
        auth: this.oauth2Client,
      });
      const me = await people.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses,names,photos',
      });

      const { name, email, imageUrl } = this.parseResponse(me.data);
      const createUser = await this.prisma.user.create({
        data: { name, email, imageUrl },
      });

      const token = AuthHelper.makeAccessToken(createUser.userId);
      return token;
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new InternalServerError(err.message);
    }
  }
}
