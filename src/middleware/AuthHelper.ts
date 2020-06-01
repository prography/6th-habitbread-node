import { PrismaClient } from '@prisma/client';
import jsonwebtoken, { SignOptions } from 'jsonwebtoken';
import { Action } from 'routing-controllers';
import env from '../configs/index';
import { AuthError, BadRequestError, NotFoundError } from '../exceptions/Exception';

const signOptions: SignOptions = {
  algorithm: 'HS384',
};

export interface AuthPayload {
  userId: number;
}
const prisma: PrismaClient = new PrismaClient();

export class AuthHelper {
  public static isBearerToken(token: string) {
    return /Bearer\s[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(token);
  }

  public static async currentUserChecker(action: Action) {
    const bearerToken: string = action.request.headers.authorization;
    if (bearerToken === undefined) throw new BadRequestError('AccessToken이 없습니다.');
    if (AuthHelper.isBearerToken(bearerToken) === false) throw new BadRequestError('Token 형식이 올바르지 않습니다.');
    const token = bearerToken.split('Bearer ')[1];
    const currentUser = AuthHelper.extractUserFromToken(token);
    const user = await prisma.user.findOne({ where: { userId: currentUser } });
    if (user === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
    return user;
  }

  public static makeAccessToken(userId: number): string {
    const payload = {
      userId,
    };
    const token = jsonwebtoken.sign(payload, env.PASSWORD_SECRET!, signOptions);
    return token;
  }

  public static extractUserFromToken(token: string) {
    try {
      const data = jsonwebtoken.verify(token, env.PASSWORD_SECRET!, signOptions) as AuthPayload;
      return data.userId;
    } catch (err) {
      throw new AuthError(err);
    }
  }
}
