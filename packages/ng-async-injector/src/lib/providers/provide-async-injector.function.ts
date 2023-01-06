import { StaticClassProvider } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';

export function provideAsyncInjector(): StaticClassProvider {
  return { provide: AsyncInjector, useClass: AsyncInjector, deps: [] };
}
