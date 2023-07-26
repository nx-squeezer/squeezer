import { StaticProvider } from '@angular/core';
import { NG_ASYNC_VALIDATORS } from '@angular/forms';

import { LOAD_VALIDATOR } from '../tokens/load-validator.token';
import { LoadValidatorFn } from '../types/load-validator-fn';
import { LazyValidator } from '../validators/lazy-validator';

export function provideLazyValidator(loadValidatorFn: LoadValidatorFn): StaticProvider[] {
  return [
    {
      provide: NG_ASYNC_VALIDATORS,
      useClass: LazyValidator,
      multi: true,
      deps: [],
    },
    { provide: LOAD_VALIDATOR, useValue: loadValidatorFn },
  ];
}
