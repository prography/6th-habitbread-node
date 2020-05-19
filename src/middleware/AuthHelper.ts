import { PrismaClient } from '@prisma/client';
import jsonwebtoken, { SignOptions } from 'jsonwebtoken';
import { Action } from 'routing-controllers';
import { UserID } from '../validations/UserValidation';

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
    if (AuthHelper.isBearerToken(bearerToken) === null) { return false; }
    const token = bearerToken.split('Bearer ')[1];
    return AuthHelper.extractUserFromToken(token);
  }

  public static makeAccessToken(id: UserID): string {
    const payload = {
      userId: id.userId,
    };
    const signOptions: SignOptions = {
      algorithm: 'HS384',
      expiresIn: '1m',
    };
    const token = jsonwebtoken.sign(payload, process.env.PASSWORD_SECRET || '', signOptions);
    return token;
  }

  public static async extractUserFromToken(token: string) {
    try{
      const data = jsonwebtoken.verify(
        token, process.env.PASSWORD_SECRET || '', { algorithms: ['HS384'] }) as AuthPayload;
      return data.userId;
    } catch (err){
      return err;
    }
  }
}
