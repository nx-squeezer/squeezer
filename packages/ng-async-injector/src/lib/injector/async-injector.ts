import { Injectable } from '@angular/core';

import { AsyncInjectionTokenTypes } from '../interfaces/async-injection-token-type';
import { AsyncStaticProvider } from '../interfaces/async-static-provider';
import { AsyncInjectionToken } from '../tokens/async-injection-token';

interface AsyncInjectableRecord<T> {
  injectionToken: AsyncInjectionToken<T>;
  useAsyncFactory: () => Promise<T>;
  status: 'initial' | 'resolving' | 'resolved' | 'error';
  promise: Promise<T> | null;
  resolvedValue: T | null;
}

@Injectable({ providedIn: 'root' })
export class AsyncInjector {
  private readonly records = new Map<AsyncInjectionToken<any>, AsyncInjectableRecord<any>>();

  register<T>(asyncStaticProvider: AsyncStaticProvider<T>) {
    const { provide: injectionToken, useAsyncFactory, mode } = asyncStaticProvider;

    this.records.set(injectionToken, {
      injectionToken,
      useAsyncFactory,
      status: 'initial',
      promise: null,
      resolvedValue: null,
    });

    if (mode === 'eager') {
      this.resolve(injectionToken);
    }
  }

  get<T>(injectionToken: AsyncInjectionToken<T>): T {
    const injectable = this.records.get(injectionToken);

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
    const injectable = this.records.get(injectionToken);

    if (injectable == null) {
      throw new Error(`${injectionToken.toString()} not provided.`);
    }

    return hydrate(injectable);
  }

  resolveMany<T extends AsyncInjectionToken<any>[]>(...injectionTokens: T): Promise<AsyncInjectionTokenTypes<[...T]>> {
    return Promise.all(
      injectionTokens.map((injectionToken: AsyncInjectionToken<any>): Promise<any> => this.resolve(injectionToken))
    ) as Promise<AsyncInjectionTokenTypes<[...T]>>;
  }

  async resolveAll(): Promise<void> {
    const pendingInjectables: AsyncInjectableRecord<any>[] = [...this.records.values()].filter(
      ({ status }) => status !== 'resolved'
    );
    await Promise.all(pendingInjectables.map((injectable) => hydrate(injectable)));
  }
}

function hydrate<T>(injectable: AsyncInjectableRecord<T>): Promise<T> {
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
      throw new Error(`${injectable.injectionToken.toString()} failed resolution: ${error}`);
    });

  injectable.promise = promise;

  return promise;
}
