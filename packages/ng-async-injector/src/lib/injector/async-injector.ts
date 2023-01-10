import { EnvironmentInjector, inject, Injectable, InjectionToken } from '@angular/core';

import { isAsyncClassProvider } from '../interfaces/async-class-provider';
import { AsyncStaticProvider } from '../interfaces/async-static-provider';
import { isAsyncValueProvider } from '../interfaces/async-value-provider';
import { InjectionTokenTypeCollection, InjectionTokenTypeMap } from '../interfaces/injection-token-type';

interface AsyncInjectableRecord<T> {
  injectionToken: InjectionToken<T>;
  valuePromise: () => Promise<T>;
  status: 'initial' | 'resolving' | 'resolved' | 'error';
  promise: Promise<T> | null;
  resolvedValue: T | null;
}

@Injectable({ providedIn: 'root' })
export class AsyncInjector {
  private readonly records = new Map<InjectionToken<any>, AsyncInjectableRecord<any>>();

  register<T>(asyncStaticProvider: AsyncStaticProvider<T>) {
    const { provide: injectionToken, mode } = asyncStaticProvider;

    this.records.set(injectionToken, makeAsyncInjectableRecord(asyncStaticProvider));

    if (mode === 'eager') {
      this.resolve(injectionToken);
    }
  }

  get<T>(injectionToken: InjectionToken<T>): T {
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

  resolve<T>(injectionToken: InjectionToken<T>): Promise<T> {
    const injectable = this.records.get(injectionToken);

    if (injectable == null) {
      throw new Error(`${injectionToken.toString()} not provided.`);
    }

    return hydrate(injectable);
  }

  resolveMany<T extends { [key: string]: InjectionToken<any> }>(injectionTokens: T): Promise<InjectionTokenTypeMap<T>>;
  resolveMany<T extends InjectionToken<any>[]>(...injectionTokens: T): Promise<InjectionTokenTypeCollection<[...T]>>;
  resolveMany(
    ...injectionTokens: (InjectionToken<any> | { [key: string]: InjectionToken<any> })[]
  ): Promise<any[] | { [key: string]: any }> {
    if (injectionTokens.length === 0) {
      throw new Error(`Provide at least one injection token to be resolved when calling resolveMany().`);
    }

    if (isInjectionTokenCollection(injectionTokens)) {
      return this.resolveManyFromCollection(injectionTokens);
    } else {
      return this.resolveManyFromMap(injectionTokens[0] as { [key: string]: InjectionToken<any> });
    }
  }

  private resolveManyFromCollection<T extends InjectionToken<any>[]>(
    injectionTokens: T
  ): Promise<InjectionTokenTypeCollection<[...T]>> {
    return Promise.all(
      injectionTokens.map((injectionToken: InjectionToken<any>): Promise<any> => this.resolve(injectionToken))
    ) as Promise<InjectionTokenTypeCollection<[...T]>>;
  }

  private async resolveManyFromMap<T extends { [key: string]: InjectionToken<any> }>(
    injectionTokens: T
  ): Promise<InjectionTokenTypeMap<T>> {
    const values: { [key: string]: any } = {};

    await Promise.all(
      Object.entries(injectionTokens).map(([key, injectionToken]) =>
        this.resolve(injectionToken).then((value) => {
          values[key] = value;
        })
      )
    );

    return values as InjectionTokenTypeMap<T>;
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
    .valuePromise()
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

function isInjectionTokenCollection(
  injectionTokens: (InjectionToken<any> | { [key: string]: InjectionToken<any> })[]
): injectionTokens is InjectionToken<any>[] {
  return injectionTokens.every((injectionToken) => injectionToken instanceof InjectionToken);
}

function makeAsyncInjectableRecord(asyncStaticProvider: AsyncStaticProvider<any>): AsyncInjectableRecord<any> {
  const envInjector = inject(EnvironmentInjector);
  const runInContext = (fn: () => any) => {
    let result: any;
    envInjector.runInContext(() => {
      result = fn();
    });
    return result;
  };

  let valuePromise: () => Promise<any>;

  if (isAsyncValueProvider(asyncStaticProvider)) {
    valuePromise = () => asyncStaticProvider.useAsyncValue();
  } else if (isAsyncClassProvider(asyncStaticProvider)) {
    valuePromise = () => asyncStaticProvider.useAsyncClass().then((classType) => runInContext(() => new classType()));
  } else {
    valuePromise = () => asyncStaticProvider.useAsyncFactory().then((factory) => runInContext(factory));
  }

  return {
    injectionToken: asyncStaticProvider.provide,
    valuePromise,
    status: 'initial',
    promise: null,
    resolvedValue: null,
  };
}
