import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import supertest from 'supertest';
import app from '../../src/app';
import { AddCharacter } from '../../src/validations/CharacterValidation'; // src의 ts 자동 import 안됨
import { AddUser } from '../../src/validations/UserValidation';
import { assertCharacter, createCharacter } from '../utils/CharacterUtil';
import { createUser } from '../utils/UserUtil';

dotenv.config({ path: `${__dirname}/../../.env.test` });

describe('Test Character', () => {
  const client = supertest(app);
  const prisma = new PrismaClient();

  beforeEach(async done => {
    await prisma.character.deleteMany({});
    await prisma.user.deleteMany({});
    done();
  });

  // 캐릭터 전체 조회 테스트
  test('Get - /character', async () => {
    const user1 = await createUser(prisma, new AddUser('이우원', 'wwlee94@naver.com'));
    const user2 = await createUser(prisma, new AddUser('김건훈', 'rlarjsgns@naver.com'));
    await createCharacter(prisma, new AddCharacter(user1.userId), 1);
    await createCharacter(prisma, new AddCharacter(user2.userId), 2);

    const res = await client.get('/characters');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  // 특정 사용자의 캐릭터 조회 테스트
  test('Get - /character/:userId', async () => {
    const user = await createUser(prisma, new AddUser('이우원', 'wwlee94@naver.com'));
    await createCharacter(prisma, new AddCharacter(user.userId), 1);

    const res = await client.get(`/characters/${user.userId}`);
    expect(res.status).toBe(200);
    assertCharacter(res.body);
  });

  // 캐릭터 생성 테스트
  test('Post - /character', async () => {
    const user = await createUser(prisma, new AddUser('이우원', 'test@gmail.com'));

    const data = {
      userId: user.userId,
    };
    const res = await client.post('/characters').send(data);
    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(user.userId);
    assertCharacter(res.body);
  });

  // 캐릭터 경험치 계산 테스트
  test('PUT - /character/calculate', async () => {
    const user = await createUser(prisma, new AddUser('이우원', 'wwlee94@naver.com'));
    await createCharacter(prisma, new AddCharacter(user.userId), 1);

    const data = {
      userId: user.userId,
      value: 10000,
    };
    const res = await client.put('/characters/calculate').send(data);
    expect(res.status).toBe(200);
    assertCharacter(res.body);
    expect(res.body.exp).toBe(10000);
  });

  // 캐릭터 삭제 테스트
  test('Delete - /character', async () => {
    const user1 = await createUser(prisma, new AddUser('이우원', 'wwlee94@naver.com'));
    const user2 = await createUser(prisma, new AddUser('김건훈', 'rlarjsgns@naver.com'));
    const character = await createCharacter(prisma, new AddCharacter(user1.userId), 1);
    await createCharacter(prisma, new AddCharacter(user2.userId), 2);

    const data = {
      characterId: character.characterId,
    };
    const res1 = await client.delete('/characters').send(data);
    expect(res1.status).toBe(200);
    assertCharacter(res1.body);
    const res2 = await client.get('/characters');
    expect(res2.status).toBe(200);
    expect(res2.body.length).toBe(1);
  });

  afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await prisma.disconnect();
    done();
  });
});
