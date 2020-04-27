import { Test } from '../src/Test';

describe('test', () => {
  const cal = new Test();

  test('test: 5 + 5 = 10', () => {
    expect(cal.add(5, 5)).toEqual(10);
  });
});
