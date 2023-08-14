import { ValidatorFn } from '@angular/forms';

import { DefaultExport } from '@nx-squeezer/utils';

export type LoadValidatorFn = () => Promise<DefaultExport<ValidatorFn>>;
