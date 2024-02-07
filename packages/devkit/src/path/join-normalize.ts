import { join } from 'path';

import { slash } from './slash';

/**
 * Join all arguments together and normalize the resulting path with slashes according to the file system.
 */
export function joinNormalize(...paths: string[]): string {
  return slash(join(...paths));
}
