import { PrismaClient } from '@prisma/client';
import { CurrentUser, Get, JsonController, Params } from 'routing-controllers';
import { AuthHelper } from '../middleware/AuthHelper';
import { UserID } from '../validations/UserValidation';
import { BaseController } from './BaseController';

@JsonController('/users/:userId/token')
export class TokenTestController extends BaseController {
    private prisma: PrismaClient;

    constructor() {
        super();
        this.prisma = new PrismaClient();
    }

    @Get('/create')
    public  async createToken(
        @Params({ validate: true }) id: UserID,
    ){
        const token = AuthHelper.makeAccessToken(id);
        console.log(token);
        return token;
    }

    @Get('/check')
    public  async checkToken(
        @Params({ validate: true }) id: UserID,
        @CurrentUser({ required: true }) token: string
    ){
        console.log(token);
        return token;
    }
}
