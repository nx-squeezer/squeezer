import { join } from 'path';

import { slash } from './slash';

export function joinNormalize(...paths: string[]): string {
  return slash(join(...paths));
}
