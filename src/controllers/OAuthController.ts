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
import { errorService } from '../services/LogService';
import { BaseController } from './BaseController';

@UseBefore(urlencoded({ extended: true }))
@JsonController('/oauth')
export class OAuthControllers extends BaseController {
  private prisma: PrismaClient;
  private oauth2Client = new google.auth.OAuth2(env.GOOGLE.CLIENT_ID, env.GOOGLE.CLIENT_SECRET, env.GOOGLE.REDIRECT_URL);
  private parseResponse = (data: any) => {
    return {
      name: data.names.length ? data.names[0].displayName : '습관이',
      oauthKey: data.emailAddresses[0].value,
    };
  };
  private googleResponse = (data: any) => {
    return {
      name: data.name ? data.name : '습관이',
      oauthKey: data.email,
    };
  };
  private authKey = fs.readFileSync('./src/configs/apple-auth/AuthKey.p8').toString();
  private authIos = new AppleAuth(env.APPLE.IOS, this.authKey, 'text');
  private authWeb = new AppleAuth(env.APPLE.WEB, this.authKey, 'text');

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // google verify (Android & iOS)
  @Post('/google/verify')
  public async GoogleSignIn(@Body() idToken: any) {
    console.log(idToken);
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: idToken.idToken,
        audience: env.GOOGLE.CLIENT_ID!,
      });

      const payload = ticket.getPayload();
      console.log(payload);

      const { name, oauthKey } = this.googleResponse(payload);
      if (oauthKey === null) throw new InternalServerError('알 수 없는 Error 발생');

      let isNewUser = false;
      let user = await this.prisma.user.findOne({
        where: { oauthKey },
      });
      if (user === null) {
        user = await this.prisma.user.create({
          data: { name, oauthKey },
        });
        isNewUser = true;
      }
      const token = AuthHelper.makeAccessToken(user.userId);
      return { accessToken: token, isNewUser };
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // google test login (Web)
  @Get('/google')
  public async GoogleOAuth(@Res() res: Response) {
    const scopes = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    res.redirect(url);
    return res.end();
  }

  // google test login callback (Web)
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
        personFields: 'emailAddresses,names',
      });

      const { name, oauthKey } = this.parseResponse(me.data);
      if (oauthKey === null) throw new InternalServerError('알 수 없는 Error 발생');
      let user = await this.prisma.user.findOne({
        where: { oauthKey },
      });
      if (user === null) {
        user = await this.prisma.user.create({
          data: { name, oauthKey },
        });
      }
      const token = AuthHelper.makeAccessToken(user.userId);
      return { accessToken: token };
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // Apple IOS 인증
  @Post('/apple/verify')
  public async appleOAuth(@Body() body: Record<string, string>) {
    try {
      if (body.code === null) throw new InternalServerError('알 수 없는 Error 발생');

      const response: AppleAuthAccessToken = await this.authIos.accessToken(body.code);

      const idToken = jwt.decode(response.id_token);
      if (idToken === null || typeof idToken === 'string') throw new BadRequestError('토큰의 정보를 가져올 수 없습니다.');

      const oauthKey = idToken.sub;
      let userName = '습관이';
      if (body.user) {
        const { name } = JSON.parse(body.user);
        userName = `${name.lastName} ${name.firstName}`;
      }

      let isNewUser = false;
      let user = await this.prisma.user.findOne({
        where: { oauthKey },
      });
      if (user === null) {
        user = await this.prisma.user.create({
          data: { oauthKey, name: userName },
        });
        isNewUser = true;
      }
      const token = AuthHelper.makeAccessToken(user.userId);
      return { accessToken: token, isNewUser };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message || err);
    }
  }

  // Test Web Login
  @Get('/apple')
  public apple(@Res() res: Response) {
    return res.send(`<a href="${this.authWeb.loginURL()}">Sign in with Apple</a>`);
  }

  // Apple 서버로부터 callback 받는 라우터
  @Post('/apple/callback')
  public async appleOAuthCallback(@Body() body: Record<string, string>) {
    try {
      if (body.code === null) throw new InternalServerError('알 수 없는 Error 발생');

      const response: AppleAuthAccessToken = await this.authWeb.accessToken(body.code);

      const idToken = jwt.decode(response.id_token);
      if (idToken === null || typeof idToken === 'string') throw new BadRequestError('토큰의 정보를 가져올 수 없습니다.');

      const oauthKey = idToken.sub;
      let userName = '습관이';
      if (body.user) {
        const { name } = JSON.parse(body.user);
        userName = `${name.lastName} ${name.firstName}`;
      }

      let user = await this.prisma.user.findOne({
        where: { oauthKey },
      });
      if (user === null) {
        user = await this.prisma.user.create({
          data: { oauthKey, name: userName },
        });
      }
      const token = AuthHelper.makeAccessToken(user.userId);
      return { accessToken: token };
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message || err);
    }
  }
}
