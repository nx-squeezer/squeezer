import {
  EnvironmentInjector,
  inject,
  Injectable,
  InjectFlags,
  InjectionToken,
  InjectOptions,
  ProviderToken,
} from '@angular/core';

import { isAsyncClassProvider } from '../interfaces/async-class-provider';
import { AsyncStaticProvider } from '../interfaces/async-static-provider';
import { isAsyncValueProvider } from '../interfaces/async-value-provider';
import { InjectionContext } from '../interfaces/injection-context';
import { InjectionTokenTypeCollection, InjectionTokenTypeMap } from '../interfaces/injection-token-type';
import { calculateCircularDependencyChain } from '../utils/calculate-circular-dependencies.function';

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

  // The key is the injection token, which depends on the injection tokens in the value
  private readonly dependencyMap = new Map<InjectionToken<any>, InjectionToken<any>[]>();

  register<T>(asyncStaticProvider: AsyncStaticProvider<T>) {
    const { provide: injectionToken, mode } = asyncStaticProvider;

    this.records.set(injectionToken, this.makeAsyncInjectableRecord(asyncStaticProvider));

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
      return Promise.reject(`${injectionToken.toString()} not provided.`);
    }

    return hydrate(injectable);
  }

  resolveMany<T extends { [key: string]: InjectionToken<any> }>(injectionTokens: T): Promise<InjectionTokenTypeMap<T>>;
  resolveMany<T extends InjectionToken<any>[]>(...injectionTokens: T): Promise<InjectionTokenTypeCollection<[...T]>>;
  resolveMany(
    ...injectionTokens: (InjectionToken<any> | { [key: string]: InjectionToken<any> })[]
  ): Promise<any[] | { [key: string]: any }> {
    if (injectionTokens.length === 0) {
      return Promise.reject(`Provide at least one injection token to be resolved when calling resolveMany().`);
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

  private makeAsyncInjectableRecord(asyncStaticProvider: AsyncStaticProvider<any>): AsyncInjectableRecord<any> {
    const envInjector = inject(EnvironmentInjector);
    const runInContext = (fn: () => any) => {
      let result: any;
      envInjector.runInContext(() => (result = fn()));
      return result;
    };

    const injectionContext: InjectionContext = {
      // eslint-disable-next-line @delagen/deprecation/deprecation
      inject: <T>(token: ProviderToken<T>, options: InjectOptions | InjectFlags = InjectFlags.Default): T | null =>
        // eslint-disable-next-line @delagen/deprecation/deprecation
        runInContext(() => inject(token, options as any)),
      resolve: <T>(injectionToken: InjectionToken<T>) => {
        this.processDependency(asyncStaticProvider.provide, injectionToken);
        return this.resolve(injectionToken);
      },
    };

    let valuePromise: () => Promise<any>;

    if (isAsyncValueProvider(asyncStaticProvider)) {
      valuePromise = () => asyncStaticProvider.useAsyncValue();
    } else if (isAsyncClassProvider(asyncStaticProvider)) {
      valuePromise = () => asyncStaticProvider.useAsyncClass().then((classType) => runInContext(() => new classType()));
    } else {
      valuePromise = () =>
        asyncStaticProvider.useAsyncFactory().then((factory) => runInContext(() => factory(injectionContext)));
    }

    return {
      injectionToken: asyncStaticProvider.provide,
      valuePromise,
      status: 'initial',
      promise: null,
      resolvedValue: null,
    };
  }

  private processDependency(
    dependantInjectionToken: InjectionToken<any>,
    dependsOnInjectionToken: InjectionToken<any>
  ) {
    const dependsOn: InjectionToken<any>[] | undefined = this.dependencyMap.get(dependantInjectionToken) ?? [];
    dependsOn.push(dependsOnInjectionToken);
    this.dependencyMap.set(dependantInjectionToken, dependsOn);

    const cyclicDependencies = this.dependencyMap.get(dependsOnInjectionToken);
    if (cyclicDependencies == null) {
      return;
    }

    const dependencyChain = calculateCircularDependencyChain(this.dependencyMap, [
      dependsOnInjectionToken,
    ]) as InjectionToken<any>[];

    const stringifiedDependencyChain = dependencyChain.map((token) => token.toString()).join(' -> ');
    throw new Error(`Cyclic dependency on async providers: ${stringifiedDependencyChain}`);
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

      return error instanceof Error
        ? Promise.reject(error)
        : Promise.reject(`${injectable.injectionToken.toString()} failed resolution: ${error}`);
    });

  injectable.promise = promise;

  return promise;
}

function isInjectionTokenCollection(
  injectionTokens: (InjectionToken<any> | { [key: string]: InjectionToken<any> })[]
): injectionTokens is InjectionToken<any>[] {
  return injectionTokens.every((injectionToken) => injectionToken instanceof InjectionToken);
}
