import { User } from '@prisma/client';
import { validate } from 'class-validator';
import { CurrentUser, Delete, Get, JsonController, Params } from 'routing-controllers';
import { BadRequestError } from '../exceptions/Exception';
import { ItemService } from '../services/ItemService';
import { GetUserItemRequestDto } from '../validations/UserItemValidation';
import { BaseController } from './BaseController';

@JsonController('/items')
export class UserItemController extends BaseController {
  private itemService: ItemService;

  constructor() {
    super();
    this.itemService = new ItemService();
  }

  // 특정 사용자의 모든 아이템 조회 API
  @Get()
  public async index(@CurrentUser() currentUser: User) {
    return await this.itemService.findAllByUserId(currentUser);
  }

  // 특정 사용자의 특정 아이템 조회 API
  @Get('/:userItemId')
  public async findUserItem(@CurrentUser() currentUser: User, @Params() id: GetUserItemRequestDto) {
    const paramErrors = await validate(id);
    if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

    const item = this.itemService.findItemById(id);
    return item;
  }

  // 특정 사용자의 아이템 삭제 API
  @Delete('/:userItemId')
  public async deleteUserItem(@CurrentUser() currentUser: User, @Params() id: GetUserItemRequestDto) {
    const paramErrors = await validate(id);
    if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

    await this.itemService.deleteById(id);

    return { message: "Delete User's Item Success" };
  }
}
