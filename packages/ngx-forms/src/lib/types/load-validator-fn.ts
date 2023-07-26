import { ValidatorFn } from '@angular/forms';

export type LoadValidatorFn = () => Promise<ValidatorFn>;
