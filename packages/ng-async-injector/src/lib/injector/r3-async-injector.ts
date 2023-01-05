import { Injectable } from '@angular/core';

import { AsyncInjectionToken } from '../tokens/async-injection-token';
import { AsyncInjector } from './async-injector';

interface AsyncInjectable<T> {
  injectionToken: AsyncInjectionToken<T>;
  useAsyncFactory: () => Promise<T>;
  status: 'initial' | 'resolving' | 'resolved' | 'error';
  promise: Promise<T> | null;
  resolvedValue: T | null;
}

@Injectable()
export class R3AsyncInjector extends AsyncInjector {
  private store = new Map<AsyncInjectionToken<any>, AsyncInjectable<any>>();

  register<T>(injectionToken: AsyncInjectionToken<T>, useAsyncFactory: () => Promise<T>) {
    this.store.set(injectionToken, {
      injectionToken,
      useAsyncFactory,
      status: 'initial',
      promise: null,
      resolvedValue: null,
    });
  }

  get<T>(injectionToken: AsyncInjectionToken<T>): T {
    const injectable = this.store.get(injectionToken);

    if (injectable == null) {
      throw new Error(`${injectionToken.toString()} not provided.`);
    }

    if (injectable.status === 'error') {
      throw new Error(`${injectionToken.toString()} failed during its resolution.`);
    }

    if (injectable.status !== 'resolved') {
      throw new Error(`${injectionToken.toString()} not yet resolved.`);
    }

    return injectable.resolvedValue;
  }

  resolve<T>(injectionToken: AsyncInjectionToken<T>): Promise<T> {
    const injectable = this.store.get(injectionToken);

    if (injectable == null) {
      throw new Error(`${injectionToken.toString()} not provided.`);
    }

    if (injectable.promise) {
      return injectable.promise;
    }

    injectable.status = 'resolving';

    const promise = injectable
      .useAsyncFactory()
      .then((resolvedValue) => {
        injectable.status = 'resolved';
        injectable.resolvedValue = resolvedValue;
        return resolvedValue;
      })
      .catch((error) => {
        injectable.status = 'error';
        throw new Error(`${injectionToken.toString()} failed resolution: ${error}`);
      });

    injectable.promise = promise;

    return promise;
  }
}
