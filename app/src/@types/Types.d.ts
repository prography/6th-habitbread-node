import { User } from '@prisma/client';

export declare type JsonResponse = { [key: string]: any };

export declare type UserInfo = User & { itemTotalCount: number; percent: number };

export declare type RandomItem = { level: number; weight: number };

export declare type RedisConfig = {
  host: string;
  port: number;
};

export declare type HabitIncludeUser = {
  user: User;
  habitId: number;
  alarmTime: string | null;
  title: string;
  dayOfWeek: string;
};

export interface ServiceAccount {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
}
export interface TokenPayload {
  iss: string;
  at_hash?: string;
  email_verified?: boolean;
  sub: string;
  azp?: string;
  email?: string;
  profile?: string;
  picture?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  aud: string;
  iat: number;
  exp: number;
  nonce?: string;
  hd?: string;
  locale?: string;
}
