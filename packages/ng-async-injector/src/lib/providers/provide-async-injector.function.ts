import { StaticClassProvider } from '@angular/core';

import { AsyncInjector } from '../injector/async-injector';
import { R3AsyncInjector } from '../injector/r3-async-injector';

export function provideAsyncInjector(): StaticClassProvider {
  return { provide: AsyncInjector, useClass: R3AsyncInjector, deps: [] };
}
