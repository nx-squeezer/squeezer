import { AsyncClassProvider } from './async-class-provider';
import { AsyncFactoryProvider } from './async-factory-provider';
import { AsyncValueProvider } from './async-value-provider';

export type AsyncStaticProvider<T> = AsyncValueProvider<T> | AsyncFactoryProvider<T> | AsyncClassProvider<T>;
