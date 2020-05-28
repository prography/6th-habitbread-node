import { PrismaClient } from '@prisma/client';
import jsonwebtoken, { SignOptions } from 'jsonwebtoken';
import { Action } from 'routing-controllers';
import { AuthError, BadRequestError } from '../exceptions/Exception';

const signOptions: SignOptions = {
  algorithm: 'HS384',
};

export interface AuthPayload {
  userId: number;
}

export class AuthHelper {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public static isBearerToken(token: string) {
    return /Bearer\s[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(token);
  }

  public static async currentUserChecker(action: Action) {
    const bearerToken: string = action.request.headers.authorization;
    if (bearerToken === undefined) throw new BadRequestError('AccessToken이 없습니다.');
    if (AuthHelper.isBearerToken(bearerToken) === false) throw new BadRequestError('Token 형식이 올바르지 않습니다.');
    const token = bearerToken.split('Bearer ')[1];
    return AuthHelper.extractUserFromToken(token);
  }

  public static makeAccessToken(id: number): string {
    const payload = {
      userId: id,
    };
    const token = jsonwebtoken.sign(payload, process.env.PASSWORD_SECRET!, signOptions);
    return token;
  }

  public static extractUserFromToken(token: string) {
    try {
      const data = jsonwebtoken.verify(token, process.env.PASSWORD_SECRET!, signOptions) as AuthPayload;
      return data.userId;
    } catch (err) {
      throw new AuthError(err);
    }
  }
}
