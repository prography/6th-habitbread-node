import { User } from '@prisma/client';
import { HttpError } from 'routing-controllers';
import { InternalServerError, NoContent, NotFoundError } from '../exceptions/Exception';
import { ItemRepository } from '../repository/ItemRepository';
import { GetUserItemRequestDto } from '../validations/UserItemValidation';
import { BaseService } from './BaseService';
import { errorService } from './LogService';

export class ItemService extends BaseService {
  private itemRepository: ItemRepository;

  constructor() {
    super();
    this.itemRepository = new ItemRepository();
  }

  // 특정 사용자 ID로 모든 Item 가져오기
  public async findAllItem(user: User) {
    try {
      const items = await this.itemRepository.findAllByUserIdJoinItem(user.userId);
      if (items.length === 0) throw new NoContent('');

      return items;
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 아이템 ID로 특정 아이템 조회
  public async findItem(dto: GetUserItemRequestDto) {
    try {
      const item = await this.itemRepository.findByIdJoinItem(dto.userItemId);
      if (item === null) throw new NotFoundError('빵 아이템을 찾을 수 없습니다.');

      return item;
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }

  // 특정 사용자의 아이템 삭제
  public async deleteItem(dto: GetUserItemRequestDto) {
    try {
      const item = this.itemRepository.findById(dto.userItemId);
      if (item === null) throw new NotFoundError('빵 아이템을 찾을 수 없습니다.');

      this.itemRepository.deleteById(dto.userItemId);
    } catch (err) {
      errorService(err);
      if (err instanceof HttpError) throw err;
      throw new InternalServerError(err.message);
    }
  }
}
