import { ValidatorFn } from '@angular/forms';

import { DefaultExport } from './default-export';

export type LoadValidatorFn = () => Promise<DefaultExport<ValidatorFn>>;
