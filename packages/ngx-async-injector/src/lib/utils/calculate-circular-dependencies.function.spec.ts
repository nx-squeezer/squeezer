import { InjectionToken } from '@angular/core';

import { calculateCircularDependencyChain } from './calculate-circular-dependencies.function';

describe('calculateCircularDependencyChain', () => {
  it('should detect no circular dependencies', () => {
    const FIRST_INJECTOR_TOKEN = new InjectionToken<string>('first');
    const SECOND_INJECTOR_TOKEN = new InjectionToken<string>('second');
    const dependencyMap = new Map<InjectionToken<unknown>, InjectionToken<unknown>[]>();

    dependencyMap.set(FIRST_INJECTOR_TOKEN, [SECOND_INJECTOR_TOKEN]);

    expect(calculateCircularDependencyChain(dependencyMap, [FIRST_INJECTOR_TOKEN])).toBeNull();
  });
});
