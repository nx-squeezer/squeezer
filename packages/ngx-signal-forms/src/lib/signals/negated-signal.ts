import { WritableSignal } from '@angular/core';

import { composedSignal } from './composed-signal';

/**
 * Creates a negated writable signal for a source boolean writable signal.
 */
export const negatedSignal = (originalSignalGetter: () => WritableSignal<boolean>): WritableSignal<boolean> =>
  composedSignal({
    get: () => !originalSignalGetter()(),
    set: (enabled) => originalSignalGetter().set(!enabled),
  });
