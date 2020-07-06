import { User } from '@prisma/client';

export type JsonResponse = { [key: string]: any };

export declare type UserInfo = User & { itemTotalCount: number; percent: number };

export declare type RandomItem = { level: number; weight: number };

export declare type RedisConfig = {
  host: string;
  port: number;
  password: string;
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
