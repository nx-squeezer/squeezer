import { Injector } from '@angular/core';

import { provideAsyncInjector } from './provide-async-injector.function';
import { AsyncInjector } from '../injector/async-injector';

describe('provideAsyncInjector', () => {
  it('should provide AsyncInjector', () => {
    const rootInjector = Injector.create({ providers: [provideAsyncInjector()] });

    expect(rootInjector.get(AsyncInjector)).toBeTruthy();
  });
});
