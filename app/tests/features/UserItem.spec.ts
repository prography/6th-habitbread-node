import { PrismaClient, User } from '@prisma/client';
import dotenv from 'dotenv';
import supertest from 'supertest';
import app from '../../src/app';
import { NotFoundError } from '../../src/exceptions/Exception';
import { AuthHelper } from '../../src/middleware/AuthHelper';
import { AddItem } from '../../src/validations/ItemValidation';
import { AddUserItem } from '../../src/validations/UserItemValidation';
import { AddUser } from '../../src/validations/UserValidation';
import { Payload } from '../payloads/Payload';
import { createItem } from '../utils/ItemUtil';
import { assertUserItem, createUserItem } from '../utils/UserItemUtil';
import { createUser } from '../utils/UserUtil';

dotenv.config({ path: `${__dirname}/../../.env.test` });

describe('Test User Item', () => {
  const client = supertest(app);
  const prisma = new PrismaClient();

  let user: User;
  let token: string;
  let userItems: Array<number>;
  let userItemPayloads: Array<any>;

  beforeEach(async done => {
    await prisma.userItem.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.item.deleteMany({});

    // 사용자 생성 및 토큰 발급
    const payload = {
      name: '이우원',
      oauthKey: process.env.TEST_USER_OAUTH_KEY!,
    };
    user = await createUser(prisma, new AddUser(payload));
    token = AuthHelper.makeAccessToken(user.userId);

    // 아이템 생성
    userItemPayloads = [];
    for (const payload of Payload.ItemPayloads) {
      const item = await createItem(prisma, new AddItem(payload));
      userItemPayloads.push({
        userId: user.userId,
        itemId: item.itemId,
      });
    }

    // 사용자와 아이템 연결 - 마지막 payload는 post 테스트 시 사용
    userItems = [];
    for (let i = 0; i < userItemPayloads.length - 1; i++) {
      const userItem = await createUserItem(prisma, new AddUserItem(userItemPayloads[i]));
      userItems.push(userItem.userItemId);
    }

    done();
  });

  // 특정 사용자의 모든 아이템 조회 테스트
  test('Get - /items', async () => {
    const res = await client.get('/items').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    for (const item of res.body) {
      assertUserItem(item);
    }
  });

  // 특정 사용자의 특정 아이템 조회 테스트
  test('Get - /items/:userItemId', async () => {
    const res = await client.get(`/items/${userItems[0]}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    assertUserItem(res.body);
  });

  // 캐릭터 삭제 테스트
  test('Delete -  /items/:userItemId', async () => {
    const res1 = await client.delete(`/items/${userItems[0]}`).set('Authorization', `Bearer ${token}`);
    expect(res1.status).toBe(200);
    const res2 = await client.get(`/items/${userItems[0]}`).set('Authorization', `Bearer ${token}`);
    expect(res2.status).toBe(404);
    expect(res2.body.name).toEqual(NotFoundError.name);
  });

  // // 사용자 아이템 관계 생성 테스트
  // test('Post - /items', async () => {
  //   const itemId = userItemPayloads[userItemPayloads.length - 1].itemId; // 마지막 item payload와 user 연결
  //   const data = { itemId };

  //   const res1 = await client.post('/items').set('Authorization', `Bearer ${token}`).send(data);
  //   expect(res1.status).toBe(201);
  //   expect(res1.body.itemId).toBe(data.itemId);
  //   expect(res1.body.userId).toBe(user.userId);

  //   const res2 = await client.get(`/items/${res1.body.userItemId}`).set('Authorization', `Bearer ${token}`);
  //   expect(res2.status).toBe(200);
  //   assertUserItem(res2.body);
  // });

  afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await prisma.disconnect();
    done();
  });
});
