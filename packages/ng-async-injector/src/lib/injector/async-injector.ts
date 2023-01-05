import { AsyncInjectionToken } from '../tokens/async-injection-token';

/**
 * Concrete async injectors implement this interface. Async injectors are configured with providers that associate dependencies of various
 * types with async injection tokens.
 */
export abstract class AsyncInjector {
  abstract register<T>(injectionToken: AsyncInjectionToken<T>, useAsyncFactory: () => Promise<T>): void;
  abstract get<T>(injectionToken: AsyncInjectionToken<T>): T;
  abstract resolve<T>(injectionToken: AsyncInjectionToken<T>): Promise<T>;
}
