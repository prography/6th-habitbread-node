import { PrismaClient } from '@prisma/client';
import { Response } from 'express';
import jsonwebtoken from 'jsonwebtoken';
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
        console.log(
            jsonwebtoken.verify(
                token, process.env.PASSWORD_SECRET || '', { algorithms: ['HS384'] }
            )
        );
        return { "AccessToken" : token  };
    }

    @Get('/check')
    public  async checkToken(
        @Params({ validate: true }) id: UserID,
        @CurrentUser({ required: true }) tokenPayload: any,
        @Res() res: Response
    ){
        try{
            if(tokenPayload === Error){
                console.log(123);
                throw new AuthError(tokenPayload);
            }
            return {
                "userId" : tokenPayload.userId,
                "userName": tokenPayload.userName
            };
        }catch(err) {
            if (err instanceof HttpError) return res.status(err.httpCode).send(err);
            throw new InternalServerError(err);
        }
    }
}
