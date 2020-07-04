import { User } from '@prisma/client';

export type JsonResponse = { [key: string]: any };

export declare type UserInfo = User & { itemTotalCount: number; percent: number };

export declare type RandomItem = { level: number; weight: number };

export interface ServiceAccount {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
}
