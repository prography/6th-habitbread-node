import { Get, JsonController } from 'routing-controllers';
import { v4 as uuid } from 'uuid';
import { ItemService } from '../services/ItemService';
import { BaseController } from './BaseController';
const id: string = uuid();

@JsonController()
export class ItemController extends BaseController {
  private itemService: ItemService;
  constructor() {
    super();
    this.itemService = new ItemService();
  }

  // 이미지 링크 테스트용
  @Get('/images')
  public index() {
    return this.itemService.findAll();
  }
}
