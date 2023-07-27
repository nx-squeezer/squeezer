# @nx-squeezer/ngx-forms <!-- omit in toc -->

[![CI](https://github.com/nx-squeezer/squeezer/actions/workflows/ci.yml/badge.svg)](https://github.com/nx-squeezer/squeezer/actions/workflows/ci.yml) [![npm latest version](https://img.shields.io/npm/v/@nx-squeezer/ngx-forms/latest.svg)](https://www.npmjs.com/package/@nx-squeezer/ngx-forms) [![CHANGELOG](https://img.shields.io/badge/CHANGELOG--orange.svg)](https://github.com/nx-squeezer/squeezer/blob/main/packages/ngx-forms/CHANGELOG.md) [![codecov](https://codecov.io/gh/nx-squeezer/squeezer/branch/main/graph/badge.svg)](https://codecov.io/gh/nx-squeezer/squeezer) ![renovate](https://img.shields.io/badge/maintaied%20with-renovate-blue?logo=renovatebot) ![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)

This library provides useful extensions for Angular forms.

- [Lazy Validation](#lazy-validation)
  - [Provide Lazy Validator in a Directive](#provide-lazy-validator-in-a-directive)
  - [In a Form Control](#in-a-form-control)
- [Installation](#installation)

## Lazy Validation

Use the following utilities to lazy load large and complex validators. Heavily inspired of this [wonderful article](https://netbasal.com/optimizing-angular-form-validation-with-lazy-load-61265536a6f2) from [@NetanelBasal](https://github.com/NetanelBasal).

### Provide Lazy Validator in a Directive

```ts
@Directive({
  selector: '[lazyValidator]',
  standalone: true,
  providers: [provideLazyValidator(() => import('./validator'))], // Internally provides NG_ASYNC_VALIDATORS
})
export class ValidatorDirective {}
```

```ts
const validator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  // Large and complex validator
};

export default validator; // Note that it works with the default export
```

### In a Form Control

```ts
export class FormComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.group({
    lazy: this.formBuilder.control('invalid', { asyncValidators: [lazyValidator(() => import('./validator'))] }),
  });
}
```

Note: the function `lazyValidator` uses internally `inject` so it has to be used in an injection context, such as field initalization.

## Installation

Do you like this library? Go ahead and use it! It is production ready, with 100% code coverage, protected by integration tests, and uses semantic versioning. To install it:

```shell
npm install @nx-squeezer/ngx-forms
```
