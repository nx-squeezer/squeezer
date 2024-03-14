import {
  EnvironmentInjector,
  inject,
  Injectable,
  InjectionToken,
  InjectOptions,
  Injector,
  OnDestroy,
  ProviderToken,
  runInInjectionContext,
} from '@angular/core';

import { isMultiProvider } from '../functions/is-multi-provider';
import { isAsyncClassProvider } from '../interfaces/async-class-provider';
import { AsyncStaticProvider } from '../interfaces/async-static-provider';
import { isAsyncValueProvider } from '../interfaces/async-value-provider';
import { InjectionContext } from '../interfaces/injection-context';
import { InjectionTokenTypeCollection, InjectionTokenTypeMap } from '../interfaces/injection-token-type';
import { calculateCircularDependencyChain } from '../utils/calculate-circular-dependencies.function';

/**
 * @internal
 */
interface AsyncInjectableRecord<T> {
  injectionToken: InjectionToken<T>;
  valuePromise: () => Promise<T>;
  status: 'initial' | 'resolving' | 'resolved' | 'error';
  promise: Promise<T> | null;
  resolvedValue: T | null;
}

/**
 * @internal
 */
@Injectable()
export class AsyncInjector implements OnDestroy {
  private readonly parentAsyncInjector = inject(AsyncInjector, { optional: true, skipSelf: true });
  private readonly injector = inject(Injector);

  private readonly records = new Map<InjectionToken<any>, AsyncInjectableRecord<any> | AsyncInjectableRecord<any>[]>();

  // The key is the injection token, which depends on the injection tokens in the value
  private readonly dependencyMap = new Map<InjectionToken<unknown>, InjectionToken<unknown>[]>();

  private destroyed = false;
  private initialized = false;

  ngOnDestroy() {
    this.destroyed = true;
    this.records.clear();
    this.dependencyMap.clear();
  }

  private assertNotDestroyed() {
    if (this.destroyed) {
      throw new Error(`Async injection token already destroyed.`);
    }
  }

  private assertNotInitialized() {
    if (this.initialized) {
      throw new Error(`Async injection token already initialized.`);
    }
  }

  private assertInitialized() {
    if (this.initialized) {
      return;
    }

    if (this.injector instanceof EnvironmentInjector) {
      throw new Error(`Async injection not yet initialized.`);
    } else {
      throw new Error(
        `Async injector provided in a component, providers can't be injected in the same injector. ` +
          `Use directive *ngxResolveAsyncProviders to resolve them before injection.`
      );
    }
  }

  init(...asyncStaticProviders: AsyncStaticProvider<unknown>[]) {
    this.assertNotDestroyed();
    this.assertNotInitialized();
    this.initialized = true;

    asyncStaticProviders.forEach((asyncStaticProvider: AsyncStaticProvider<unknown>) => {
      const { provide: injectionToken, mode } = asyncStaticProvider;
      const existingProvider = this.records.get(injectionToken);
      const isMulti = isMultiProvider(asyncStaticProvider);

      if (existingProvider != null) {
        if ((isMulti && !Array.isArray(existingProvider)) || (!isMulti && Array.isArray(existingProvider))) {
          throw new Error(`${injectionToken.toString()} mixing providers.`);
        } else if (!isMulti) {
          throw new Error(`${injectionToken.toString()} already provided.`);
        }
      }

      if (existingProvider == null && isMulti) {
        this.records.set(injectionToken, [this.makeAsyncInjectableRecord(asyncStaticProvider)]);
      } else if (Array.isArray(existingProvider)) {
        this.records.set(injectionToken, [...existingProvider, this.makeAsyncInjectableRecord(asyncStaticProvider)]);
      } else {
        this.records.set(injectionToken, this.makeAsyncInjectableRecord(asyncStaticProvider));
      }

      if (mode === 'eager') {
        this.resolve(injectionToken);
      }
    });
  }

  get<T>(injectionToken: InjectionToken<T>): T {
    this.assertNotDestroyed();
    this.assertInitialized();

    const injectable = this.records.get(injectionToken);

    if (injectable == null) {
      if (this.parentAsyncInjector != null) {
        return this.parentAsyncInjector.get(injectionToken);
      }

      throw new Error(`${injectionToken.toString()} not provided.`);
    }

    if (Array.isArray(injectable)) {
      return injectable.map((record) => this.getSingleProvider(record)) as T;
    } else {
      return this.getSingleProvider(injectable);
    }
  }

  private getSingleProvider<T>(injectableRecord: AsyncInjectableRecord<T>): T {
    if (injectableRecord.status === 'error') {
      throw new Error(`${injectableRecord.injectionToken.toString()} failed during its resolution.`);
    }

    if (injectableRecord.status !== 'resolved') {
      throw new Error(`${injectableRecord.injectionToken.toString()} not yet resolved.`);
    }

    return injectableRecord.resolvedValue as T;
  }

  resolve<T>(injectionToken: InjectionToken<T>): Promise<T> {
    this.assertNotDestroyed();
    this.assertInitialized();

    const injectable = this.records.get(injectionToken);

    if (injectable == null) {
      if (this.parentAsyncInjector != null) {
        return this.parentAsyncInjector.resolve(injectionToken);
      }
      return Promise.reject(`${injectionToken.toString()} not provided.`);
    }

    if (Array.isArray(injectable)) {
      return Promise.all(injectable.map((record) => hydrate(record))) as Promise<T>;
    } else {
      return hydrate(injectable);
    }
  }

  resolveMany<T extends { [key: string]: InjectionToken<unknown> }>(
    injectionTokens: T
  ): Promise<InjectionTokenTypeMap<T>>;
  resolveMany<T extends InjectionToken<unknown>[]>(
    ...injectionTokens: T
  ): Promise<InjectionTokenTypeCollection<[...T]>>;
  resolveMany(
    ...injectionTokens: (InjectionToken<unknown> | { [key: string]: InjectionToken<unknown> })[]
  ): Promise<unknown[] | { [key: string]: unknown }> {
    this.assertNotDestroyed();
    this.assertInitialized();

    if (injectionTokens.length === 0) {
      return Promise.reject(`Provide at least one injection token to be resolved when calling resolveMany().`);
    }

    if (isInjectionTokenCollection(injectionTokens)) {
      return this.resolveManyFromCollection(injectionTokens);
    } else {
      return this.resolveManyFromMap(injectionTokens[0] as { [key: string]: InjectionToken<unknown> });
    }
  }

  private resolveManyFromCollection<T extends InjectionToken<unknown>[]>(
    injectionTokens: T
  ): Promise<InjectionTokenTypeCollection<[...T]>> {
    return Promise.all(
      injectionTokens.map((injectionToken: InjectionToken<unknown>): Promise<unknown> => this.resolve(injectionToken))
    ) as Promise<InjectionTokenTypeCollection<[...T]>>;
  }

  private async resolveManyFromMap<T extends { [key: string]: InjectionToken<unknown> }>(
    injectionTokens: T
  ): Promise<InjectionTokenTypeMap<T>> {
    const values: { [key: string]: unknown } = {};

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
    this.assertNotDestroyed();
    this.assertInitialized();

    const pendingInjectables: AsyncInjectableRecord<unknown>[] = [...this.records.values()]
      .flat()
      .filter(({ status }) => status !== 'resolved');
    await Promise.all(pendingInjectables.map((injectable) => hydrate(injectable)));
    await this.parentAsyncInjector?.resolveAll();
  }

  private makeAsyncInjectableRecord(asyncStaticProvider: AsyncStaticProvider<unknown>): AsyncInjectableRecord<unknown> {
    const envInjector = inject(EnvironmentInjector);
    const runInContext = (fn: () => unknown) => {
      let result: unknown;
      runInInjectionContext(envInjector, () => (result = fn()));
      return result;
    };

    const injectFn = <T>(token: ProviderToken<T>, options: InjectOptions): T | null =>
      runInContext(() => inject(token, options)) as T;

    const injectionContext: InjectionContext = {
      // eslint-disable-next-line deprecation/deprecation
      inject: injectFn as typeof inject,
      resolve: <T>(injectionToken: InjectionToken<T>) => {
        this.processDependency(asyncStaticProvider.provide, injectionToken);
        return this.resolve(injectionToken);
      },
    };

    let valuePromise: () => Promise<unknown>;

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
    dependantInjectionToken: InjectionToken<unknown>,
    dependsOnInjectionToken: InjectionToken<unknown>
  ) {
    const dependsOn: InjectionToken<unknown>[] | undefined = this.dependencyMap.get(dependantInjectionToken) ?? [];
    dependsOn.push(dependsOnInjectionToken);
    this.dependencyMap.set(dependantInjectionToken, dependsOn);

    const cyclicDependencies = this.dependencyMap.get(dependsOnInjectionToken);
    if (cyclicDependencies == null) {
      return;
    }

    const dependencyChain = calculateCircularDependencyChain(this.dependencyMap, [
      dependsOnInjectionToken,
    ]) as InjectionToken<unknown>[];

    const stringifiedDependencyChain = dependencyChain.map((token) => token.toString()).join(' -> ');
    throw new Error(`Cyclic dependency on async providers: ${stringifiedDependencyChain}`);
  }
}

/**
 * @internal
 */
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

/**
 * @internal
 */
function isInjectionTokenCollection(
  injectionTokens: (InjectionToken<unknown> | { [key: string]: InjectionToken<unknown> })[]
): injectionTokens is InjectionToken<unknown>[] {
  return injectionTokens.every((injectionToken) => injectionToken instanceof InjectionToken);
}
