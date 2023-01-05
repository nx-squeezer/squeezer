import { AsyncInjector } from './async-injector';

describe('AsyncInjector', () => {
  it('should compile', () => {
    expect(new AsyncInjector()).toBeTruthy();
  });
});
