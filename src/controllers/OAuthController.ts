import { PrismaClient } from '@prisma/client';
import AppleAuth, { AppleAuthAccessToken, AppleAuthConfig } from 'apple-auth';
import { Response, urlencoded } from 'express';
import fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { Body, BodyParam, Get, JsonController, Post, Res, UseBefore } from 'routing-controllers';
import { BadRequestError, InternalServerError } from '../exceptions/Exception';
import { BaseController } from './BaseController';

const config = JSON.parse(fs.readFileSync('./config/apple-auth/config.json').toString()) as AppleAuthConfig;
const authKey = fs.readFileSync('./config/apple-auth/AuthKey.p8').toString();
const auth = new AppleAuth(config, authKey, 'text');

@UseBefore(urlencoded({ extended: true }))
@JsonController('/oauth')
export class OAuthController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // Test Login
  @Get('/apple')
  public apple(@Res() res: Response) {
    return res.send(`<a href="${auth.loginURL()}">Sign in with Apple</a>`);
  }

  // Client Secret 토큰 발급
  @Get('/apple/token')
  public async generateJwtToken() {
    console.log(auth);
    const result = await auth._tokenGenerator.generate();
    return result;
  }

  // Apple 서버로 callback 받는 라우터
  @Post('/apple/callback')
  public async appleOAuthCallback(@Body() body: Record<string, string>) {
    try {
      const response: AppleAuthAccessToken = await auth.accessToken(body.code);
      const idToken = jwt.decode(response.id_token);
      if (idToken === null || typeof idToken === 'string') throw new BadRequestError('올바른 토큰이 아닙니다.');

      const user: any = {};
      user.id = idToken.sub;
      if (idToken.email) user.email = idToken.email;
      if (body.user) {
        const { name } = JSON.parse(body.user);
        user.name = name;
      }
      return user;
    } catch (err) {
      throw new InternalServerError(err.message);
    }
  }

  // Refresh 토큰으로 Access 토큰 갱신
  @Post('/apple/refresh')
  public async updateRefreshToken(@BodyParam('refreshToken') refreshToken: string) {
    try {
      const accessToken = await auth.refreshToken(refreshToken);
      return accessToken;
    } catch (err) {
      throw new InternalServerError(err.message);
    }
  }
}
