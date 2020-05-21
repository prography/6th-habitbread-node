import { PrismaClient } from '@prisma/client';
import { validate } from 'class-validator';
import { Response } from 'express';
import { CurrentUser, Get, HttpError, JsonController, Params, Res } from 'routing-controllers';
import { AuthError, BadRequestError, InternalServerError } from '../exceptions/Exception';
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
    public  async createToken(@Params() id: UserID, @Res() res: Response){
        try{
            const errors = await validate(id);
            if(errors.length > 0) throw new BadRequestError(errors);

            const token = AuthHelper.makeAccessToken(id);
            return { "AccessToken" : token  };
        } catch(err) {
            if (err instanceof HttpError) return res.status(err.httpCode).send(err);
            throw new InternalServerError(err.message)
        }
    }

    @Get('/check')
    public  async checkToken(
        @Params() id: UserID,
        @CurrentUser() tokenPayload: any,
        @Res() res: Response
    ){
        try{
            const errors = await validate(id);
            if(errors.length > 0) throw new BadRequestError(errors);
            if(tokenPayload === null) throw new BadRequestError('AccesToken이 없습니다.');
            if(tokenPayload === false) throw new BadRequestError('Token 형식이 올바르지 않습니다.');
            if(tokenPayload instanceof Error) throw new AuthError(tokenPayload);
            return {
                "userId" : tokenPayload.userId,
                "userName": tokenPayload.userName
            };
        }catch(err) {
            if (err instanceof HttpError) return res.status(err.httpCode).send(err);
            throw new InternalServerError(err.message);
        }
    }
}
