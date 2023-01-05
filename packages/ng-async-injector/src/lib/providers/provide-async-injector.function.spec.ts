import { Injector } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';
import { provideAsyncInjector } from './provide-async-injector.function';

describe('provideAsyncInjector', () => {
  it('should provide AsyncInjector', () => {
    const rootInjector = Injector.create({ providers: [provideAsyncInjector()] });

    expect(rootInjector.get(AsyncInjector)).toBeTruthy();
  });
});
