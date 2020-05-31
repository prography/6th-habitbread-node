import { PrismaClient } from '@prisma/client';
import AppleAuth, { AppleAuthAccessToken } from 'apple-auth';
import { Response, urlencoded } from 'express';
import fs from 'fs';
import { google } from 'googleapis';
import * as jwt from 'jsonwebtoken';
import { Body, Get, HttpError, JsonController, Post, QueryParam, Res, UseBefore } from 'routing-controllers';
import env from '../configs/index';
import { BadRequestError, InternalServerError } from '../exceptions/Exception';
import { AuthHelper } from '../middleware/AuthHelper';
import { BaseController } from './BaseController';

const authKey = fs.readFileSync('./src/configs/apple-auth/AuthKey.p8').toString();
const auth = new AppleAuth(env.APPLE, authKey, 'text');

@UseBefore(urlencoded({ extended: true }))
@JsonController('/oauth')
export class OAuthControllers extends BaseController {
  private prisma: PrismaClient;
  private oauth2Client = new google.auth.OAuth2(env.GOOGLE.CLIENT_ID, env.GOOGLE.CLIENT_SECRET, env.GOOGLE.REDIRECT_URL);
  private parseResponse = (data: any) => {
    return {
      email: data.emailAddresses.length ? data.emailAddresses[0].value : 'example@mail.com',
    };
  };

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  @Get('/google/login')
  public async GoogleOAuth(@Res() res: Response) {
    const scopes = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    res.redirect(url);
    return res.end();
  }

  @Get('/google/callback')
  public async GoogleCallback(@QueryParam('code') code: string) {
    try {
      if (code === null) throw new InternalServerError('알 수 없는 Error 발생');

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

      const { email } = this.parseResponse(me.data);
      let user = await this.prisma.user.findOne({
        where: { oauthKey: email },
      });
      if (user === null) {
        user = await this.prisma.user.create({
          data: { oauthKey: email },
        });
      }
      const token = AuthHelper.makeAccessToken(user.userId);
      return { accessToken: token };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // Test Login
  @Get('/apple')
  public apple(@Res() res: Response) {
    return res.send(`<a href="${auth.loginURL()}">Sign in with Apple</a>`);
  }

  // Apple 서버로부터 callback 받는 라우터
  @Post('/apple/callback')
  public async appleOAuthCallback(@Body() body: Record<string, string>) {
    try {
      if (body.code === null) throw new InternalServerError('알 수 없는 Error 발생');

      const response: AppleAuthAccessToken = await auth.accessToken(body.code);

      const idToken = jwt.decode(response.id_token);
      if (idToken === null || typeof idToken === 'string') throw new BadRequestError('토큰의 정보를 가져올 수 없습니다.');

      const oauthKey = idToken.sub;

      let user = await this.prisma.user.findOne({
        where: {
          oauthKey,
        },
      });

      if (user === null) {
        user = await this.prisma.user.create({
          data: { oauthKey },
        });
      }

      const token = AuthHelper.makeAccessToken(user.userId);
      return { accessToken: token };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message || err);
    }
  }
}
