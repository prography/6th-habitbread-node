import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import app from '../../src/app';
import { Character } from '../../src/validations/Character';

const assertItem = (item: any) => {
  const expectKeys = ['characterId', 'userId', 'exp'];
  Object.keys(item).forEach(key => {
    const idx = expectKeys.indexOf(key);
    if (idx > -1) {
      expectKeys.splice(idx, 1);
    }
  });
  expect(expectKeys.length).toBe(0);
};

const createCharacter = async (prisma: PrismaClient, character: Character, id: number) => {
  await prisma.character.create({
    data: {
      characterId: id,
      exp: character.exp,
      users: {
        create: {
          name: '이우원',
          email: 'test@gmail.com',
        },
      },
    },
  });
};

describe('Test Character', () => {
  const client = supertest(app);
  const prisma = new PrismaClient();
  const character = [new Character(1), new Character(2)];

  beforeEach(async done => {
    await prisma.character.deleteMany({});
    await prisma.user.deleteMany({});
    done();
  });

  test('Get - /character/:userId', async done => {
    // *특정 id를 가지는 user를 생성해야함
    await createCharacter(prisma, character[0], 1);
    try {
      const res = await client.get('/character/1');
      expect(res.status).toBe(200);
      assertItem(res.body);
      done();
    } catch (error) {
      console.log(error);
      done();
    }
  });

  test('Post - /character', async done => {
    const data = {
      userId: 1,
    };
    // *특정 id를 가지는 user를 생성해야함
    const res = await client.post('/character').send(data);
    expect(res.status).toBe(200);
    done();
  });

  test('Post - /character/calculate', async () => {
    const data = {
      usrId: 1,
      value: 100,
    };
    const res = await client.post('/character/calculate').send(data);
    expect(res.status).toBe(200);
  });

  afterAll(async done => {
    // Closing the DB connection allows Jest to exit successfully.
    prisma.disconnect();
    done();
  });
});
