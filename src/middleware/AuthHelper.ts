import { PrismaClient } from '@prisma/client';
import jsonwebtoken, { SignOptions } from 'jsonwebtoken';
import { Action } from 'routing-controllers';
import { UserID } from '../validations/UserValidation';

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
    if(bearerToken === undefined) return null;
    if (AuthHelper.isBearerToken(bearerToken) === false) return false;
    const token = bearerToken.split('Bearer ')[1];
    return AuthHelper.extractUserFromToken(token);
  }

  public static makeAccessToken(id: UserID): string {
    const payload = {
      userId: id.userId
    };
    const token = jsonwebtoken.sign(payload, process.env.PASSWORD_SECRET!, signOptions);
    return token;
  }

  public static async extractUserFromToken(token: string) {
    try{
      const data = jsonwebtoken.verify(token, process.env.PASSWORD_SECRET!, signOptions) as AuthPayload;
      return data.userId;
    } catch (err){
      return err;
    }
  }
}
