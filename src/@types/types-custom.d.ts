import { User } from '@prisma/client';

declare module 'types-custom' {
  export type JsonResponse = { [key: string]: any };
}

export declare type UserInfo = User & { itemTotalCount: number; nextLevelAchievement: number };
