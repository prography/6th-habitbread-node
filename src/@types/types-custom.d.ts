import { User } from '@prisma/client';

export type JsonResponse = { [key: string]: any };

export declare type UserInfo = User & { itemTotalCount: number; level: number; levelPercent: number };

export declare type RandomItem = { level: number; weight: number };
