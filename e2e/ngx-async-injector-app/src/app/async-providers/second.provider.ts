import { InjectionContext } from '@nx-squeezer/ngx-async-injector';

import { FIRST_INJECTION_TOKEN } from '../async-tokens/first.token';

export async function secondProviderFactory({ resolve }: InjectionContext): Promise<string> {
  await resolve(FIRST_INJECTION_TOKEN);
  return 'Provided with useAsyncFactory';
}
