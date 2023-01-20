import { InjectionToken } from '@angular/core';

import type { ThirdProvider } from '../async-providers/third.provider';

export const THIRD_INJECTION_TOKEN = new InjectionToken<ThirdProvider>('third');
