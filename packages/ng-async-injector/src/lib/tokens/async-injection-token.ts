import { InjectionToken } from '@angular/core';

export class AsyncInjectionToken<T> extends InjectionToken<T> {
  constructor(description: string) {
    super(description);
  }

  override toString() {
    return `AsyncInjectionToken ${this._desc}`;
  }
}
