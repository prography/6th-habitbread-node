import { Response, urlencoded } from 'express';
import { Body, Get, JsonController, Post, QueryParam, Res, UseBefore } from 'routing-controllers';
import { OAuthService } from '../services/OAuthService';
import { BaseController } from './BaseController';

@JsonController('/oauth')
export class OAuthControllers extends BaseController {
  private oAuthService: OAuthService;
  constructor() {
    super();
    this.oAuthService = new OAuthService();
  }

  // google verify (Android & iOS)
  @Post('/google/verify')
  public async GoogleSignIn(@Body() idToken: any) {
    return await this.oAuthService.googleSignInForMobile(idToken);
  }

  // google test login (Web)
  @Get('/google')
  public async GoogleOAuth(@Res() res: Response) {
    return this.oAuthService.googleOAuthForWeb(res);
  }

  // google test login callback (Web)
  @Get('/google/callback')
  public async GoogleCallback(@QueryParam('code') code: string) {
    return this.oAuthService.GoogleCallbackForWeb(code);
  }

  // Apple IOS 인증
  @Post('/apple/verify')
  public async appleOAuth(@Body() body: Record<string, any>) {
    return this.oAuthService.appleOAuth(body);
  }

  // Test Web Login
  @Get('/apple')
  public apple(@Res() res: Response) {
    return this.oAuthService.apple(res);
  }

  // Apple 서버로부터 callback 받는 라우터
  @Post('/apple/callback')
  @UseBefore(urlencoded({ extended: true }))
  public async appleOAuthCallback(@Body() body: Record<string, string>) {
    return this.oAuthService.appleOAuthCallback(body);
  }
}
