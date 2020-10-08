import AppleAuth, { AppleAuthAccessToken } from 'apple-auth';
import { Response } from 'express';
import fs from 'fs';
import { google, people_v1 } from 'googleapis';
import jsonwebtoken from 'jsonwebtoken';
import { Body, HttpError, JsonController } from 'routing-controllers';
import { TokenPayload } from '../@types/Types';
import env from '../configs/index';
import { BadRequestError, InternalServerError } from '../exceptions/Exception';
import { AuthHelper } from '../middleware/AuthHelper';
import { UserRepository } from '../repository/UserRepository';
import { errorService } from '../services/LogService';
import { BaseService } from './BaseService';

@JsonController('/oauth')
export class OAuthService extends BaseService {
  private userRepository: UserRepository;
  private oauth2Client = new google.auth.OAuth2(env.GOOGLE.CLIENT_ID, env.GOOGLE.CLIENT_SECRET, env.GOOGLE.REDIRECT_URL);
  private googleResponseForWeb = (data: any) => {
    return {
      userName: data.names.length ? data.names[0].displayName : '습관이',
      oauthKey: data.emailAddresses[0].value,
    };
  };
  private googleResponseForMobile = (data: any) => {
    return {
      userName: data.name ? data.name : '습관이',
      oauthKey: data.email,
    };
  };
  private authKey = fs.readFileSync('./src/configs/apple-auth/AuthKey.p8').toString();
  private authIos = new AppleAuth(env.APPLE.IOS, this.authKey, 'text');
  private authWeb = new AppleAuth(env.APPLE.WEB, this.authKey, 'text');

  constructor() {
    super();
    this.userRepository = new UserRepository();
  }

  public async googleSignInForMobile(@Body() idToken: any) {
    console.log(idToken);
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: idToken.idToken,
        audience: env.GOOGLE.CLIENT_ID!,
      });

      const payload = ticket.getPayload();
      console.log(payload);

      const { accessToken, isNewUser } = await this.checkUserInfoWithGoogle(payload, 'Mobile');
      return { accessToken, isNewUser };
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  public googleOAuthForWeb(res: Response) {
    const scopes = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'];
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    res.redirect(url);
    return res.end();
  }

  public async GoogleCallbackForWeb(code: string) {
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

      const { accessToken } = await this.checkUserInfoWithGoogle(me.data, 'Web');
      return { accessToken };
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  public apple(res: Response) {
    res.redirect(this.authWeb.loginURL());
    return res.end();
  }

  public async appleOAuth(body: Record<string, any>) {
    try {
      if (body.code === null) throw new InternalServerError('알 수 없는 Error 발생');
      const { accessToken, isNewUser } = await this.makeAccessTokenWithApple(body, 'ios');
      return { accessToken, isNewUser };
    } catch (err) {
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message || err);
    }
  }

  public async appleOAuthCallback(body: Record<string, string>) {
    try {
      if (body.code === null) throw new InternalServerError('알 수 없는 Error 발생');
      const { accessToken } = await this.makeAccessTokenWithApple(body, 'web');
      return { accessToken };
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message || err);
    }
  }

  private async findOrUpdateUser(data: { userName: string; oauthKey: string }) {
    let isNewUser = false;
    let user = await this.userRepository.findByOAuthKey(data.oauthKey);
    if (user === null) {
      user = await this.userRepository.create(data.userName, data.oauthKey);
      isNewUser = true;
    }
    return { user, isNewUser };
  }

  private async checkUserInfoWithGoogle(payload: TokenPayload | people_v1.Schema$Person | undefined, type: string) {
    let googleData;
    if (type == 'Web') {
      googleData = this.googleResponseForWeb(payload);
    } else {
      googleData = this.googleResponseForMobile(payload);
    }
    if (googleData.oauthKey === null) throw new InternalServerError('알 수 없는 Error 발생');

    const { user, isNewUser } = await this.findOrUpdateUser(googleData);
    return { accessToken: AuthHelper.makeAccessToken(user.userId), isNewUser };
  }

  private async makeAccessTokenWithApple(body: Record<string, any>, type: string) {
    let response: AppleAuthAccessToken;
    if (type == 'ios') {
      response = await this.authIos.accessToken(body.code);
    } else {
      response = await this.authWeb.accessToken(body.code);
    }
    const idToken = jsonwebtoken.decode(response.id_token);
    if (idToken === null || typeof idToken === 'string') throw new BadRequestError('토큰의 정보를 가져올 수 없습니다.');

    const oauthKey = idToken.sub;
    const { name } = body.user;
    const { lastName, firstName } = name;

    let userName = '습관이';
    if (lastName) {
      userName = lastName + firstName;
    }

    const { user, isNewUser } = await this.findOrUpdateUser({ userName, oauthKey });

    const accessToken = AuthHelper.makeAccessToken(user.userId);
    return { accessToken, isNewUser };
  }
}
