import { User } from '@prisma/client';
import { validate } from 'class-validator';
import { CurrentUser, Delete, Get, JsonController, Params } from 'routing-controllers';
import { BadRequestError } from '../exceptions/Exception';
import { ItemService } from '../services/ItemService';
import { UserItemRequestDto } from '../validations/UserItemValidation';
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
    return await this.itemService.findAllItem(currentUser);
  }

  // 특정 사용자의 특정 아이템 조회 API
  @Get('/:userItemId')
  public async findUserItem(@CurrentUser() currentUser: User, @Params() itemDto: UserItemRequestDto) {
    const paramErrors = await validate(itemDto);
    if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

    const item = this.itemService.findItem(itemDto);
    return item;
  }

  // 특정 사용자의 아이템 삭제 API
  @Delete('/:userItemId')
  public async deleteUserItem(@CurrentUser() currentUser: User, @Params() itemDto: UserItemRequestDto) {
    const paramErrors = await validate(itemDto);
    if (paramErrors.length > 0) throw new BadRequestError(paramErrors);

    await this.itemService.deleteItem(itemDto);

    return { message: "Delete User's Item Success" };
  }
}
