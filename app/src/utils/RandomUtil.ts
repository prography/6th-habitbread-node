import { Item } from '@prisma/client';
import { RandomItem } from '../@types/Types';
import { Util } from './BaseUtil';

export class RandomUtil extends Util {
  public static pickLevelOne(items: RandomItem[]) {
    let key = 0;
    let selector = Math.random();
    while (selector > 0) {
      selector -= items[key].weight;
      key++;
    }
    // selector가 key++ 되기 전에 줄어들어서 마지막은 key--
    key--;
    return items[key];
  }

  public static pickItemOne(items: Item[]): Item {
    return items[Math.floor(Math.random() * items.length)];
  }
}
