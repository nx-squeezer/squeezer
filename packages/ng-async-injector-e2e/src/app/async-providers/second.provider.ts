import { InjectionContext } from '@nx-squeezer/ng-async-injector';

import { FIRST_INJECTION_TOKEN } from '../async-tokens/first.token';

export async function secondProviderFactory({ resolve }: InjectionContext): Promise<number> {
  return (await resolve(FIRST_INJECTION_TOKEN)) + 1;
}
