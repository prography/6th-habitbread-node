import { PrismaClient } from '@prisma/client';
import AppleAuth, { AppleAuthAccessToken, AppleAuthConfig } from 'apple-auth';
import { Response, urlencoded } from 'express';
import fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { Body, Get, HttpError, JsonController, Post, Res, UseBefore } from 'routing-controllers';
import { BadRequestError, InternalServerError } from '../exceptions/Exception';
import { AuthHelper } from '../middleware/AuthHelper';
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

  // Apple 서버로부터 callback 받는 라우터
  @Post('/apple/callback')
  public async appleOAuthCallback(@Body() body: Record<string, string>) {
    try {
      const response: AppleAuthAccessToken = await auth.accessToken(body.code);

      const idToken = jwt.decode(response.id_token);
      if (idToken === null || typeof idToken === 'string') throw new BadRequestError('토큰의 정보를 가져올 수 없습니다.');

      const oauthKey = idToken.sub;
      const email = idToken.email;
      let name = '습관이';
      if (body.user) {
        const {
          name: { lastName, firstName },
        } = JSON.parse(body.user);
        name = `${lastName} ${firstName}`;
      }

      let user = await this.prisma.user.findOne({
        where: {
          oauthKey,
        },
      });

      if (user === null) {
        user = await this.prisma.user.create({
          data: { oauthKey, email, name },
        });
      }

      const token = AuthHelper.makeAccessToken(user.userId);
      return { AccessToken: token };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message || err);
    }
  }
}
