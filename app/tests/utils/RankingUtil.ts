import { JsonResponse } from '../../src/@types/Types';

// Key 값 검사
export const assertRanking = (item: JsonResponse) => {
  expect(item).toMatchObject({
    user: item.user,
    userTotalCount: item.userTotalCount,
    rankings: item.rankings,
  });
};
