import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import { CurrentUser, Get, HttpError, JsonController, Params, Res } from 'routing-controllers';
import { AuthError, InternalServerError } from '../exceptions/Exception';
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
        @CurrentUser({ required: true }) token: any,
        @Res() res: Response
    ){
        try{
            if(token === Error){
                console.log(123);
                throw new AuthError(token);
            }
            console.log("123");
            return token;
        }catch(err) {
            if (err instanceof HttpError) return res.status(err.httpCode).send(err);
            throw new InternalServerError(err);
        }
    }
}
