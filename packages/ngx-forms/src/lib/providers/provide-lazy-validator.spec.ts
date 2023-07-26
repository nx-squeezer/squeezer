import { provideLazyValidator } from './provide-lazy-validator';

describe('provideLazyValidator', () => {
  it('should execute', () => {
    expect(() => provideLazyValidator()).not.toThrow();
  });
});
