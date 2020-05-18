import { PrismaClient } from '@prisma/client';
import jsonwebtoken from 'jsonwebtoken';
import { Get, JsonController, Params } from 'routing-controllers';
import { UserID } from '../validations/UserValidation';
import { BaseController } from './BaseController';

@JsonController('/users/:userId/token')
export class UserController extends BaseController {
    private prisma: PrismaClient;

    constructor() {
    super();
    this.prisma = new PrismaClient();
    }

    @Get('/')
    public  async createToken(@Params({ validate: true }) id: UserID ){
        const payload = {
            id: id.userId
        }
        const options: jsonwebtoken.SignOptions = {
            expiresIn: Math.floor(Date.now() / 1000) + (60 * 60)
        }
        const token = jsonwebtoken.sign(payload, 'secret_key', options);
        console.log(token);
        return token;
    }
}
