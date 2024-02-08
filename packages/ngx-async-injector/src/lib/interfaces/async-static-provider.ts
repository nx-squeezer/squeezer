import { AsyncClassMultiProvider, AsyncClassProvider } from './async-class-provider';
import { AsyncFactoryMultiProvider, AsyncFactoryProvider } from './async-factory-provider';
import { AsyncValueMultiProvider, AsyncValueProvider } from './async-value-provider';

/**
 * Union type of static async providers.
 */
export type AsyncStaticProvider<T> =
  | AsyncValueProvider<T>
  | AsyncFactoryProvider<T>
  | AsyncClassProvider<T>
  | AsyncValueMultiProvider<T[]>
  | AsyncFactoryMultiProvider<T[]>
  | AsyncClassMultiProvider<T[]>;
