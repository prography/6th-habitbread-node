import { Character, PrismaClient, User } from '@prisma/client';
import dotenv from 'dotenv';
import supertest from 'supertest';
import app from '../../src/app';
import { NotFoundError } from '../../src/exceptions/Exception';
import { AuthHelper } from '../../src/middleware/AuthHelper';
import { AddCharacter } from '../../src/validations/CharacterValidation'; // src의 ts 자동 import 안됨
import { AddUser } from '../../src/validations/UserValidation';
import { assertCharacter, createCharacter } from '../utils/CharacterUtil';
import { createUser } from '../utils/UserUtil';

dotenv.config({ path: `${__dirname}/../../.env.test` });

describe('Test Character', () => {
  const client = supertest(app);
  const prisma = new PrismaClient();

  let user: User;
  let character: Character;
  let token: string;

  beforeEach(async done => {
    await prisma.character.deleteMany({});
    await prisma.habit.deleteMany({});
    await prisma.user.deleteMany({});
    user = await createUser(prisma, new AddUser('이우원', 'wwlee94@naver.com'));
    token = AuthHelper.makeAccessToken(user.userId);
    character = await createCharacter(prisma, new AddCharacter(user.userId), 1);
    done();
  });

  // 특정 사용자의 캐릭터 조회 테스트
  test('Get - /characters', async () => {
    const res = await client.get('/characters').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    assertCharacter(res.body);
  });

  // 캐릭터 생성 테스트
  test('Post - /characters', async () => {
    const postUser = await createUser(prisma, new AddUser('김건훈', 'rlarjsgns@gmail.com'));
    const postToken = AuthHelper.makeAccessToken(postUser.userId);

    const res = await client.post('/characters').set('Authorization', `Bearer ${postToken}`);
    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(postUser.userId);
    assertCharacter(res.body);
  });

  // 캐릭터 경험치 계산 테스트
  test('Patch - /characters/calculate', async () => {
    const data = {
      value: 10000,
    };
    const res = await client.patch('/characters/calculate').set('Authorization', `Bearer ${token}`).send(data);
    expect(res.status).toBe(200);
    assertCharacter(res.body);
    expect(res.body.exp).toBe(10000);
  });

  // 캐릭터 삭제 테스트
  test('Delete - /characters', async () => {
    const data = {
      characterId: character.characterId,
    };
    const res1 = await client.delete('/characters').set('Authorization', `Bearer ${token}`).send(data);
    expect(res1.status).toBe(200);
    const res2 = await client.get('/characters').set('Authorization', `Bearer ${token}`);
    expect(res2.status).toBe(404);
    expect(res2.body.name).toBe(NotFoundError.name);
  });

  afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    await prisma.disconnect();
    done();
  });
});
