import { AsyncClassMultiProvider } from '../interfaces/async-class-provider';
import { AsyncFactoryMultiProvider } from '../interfaces/async-factory-provider';
import { AsyncStaticProvider } from '../interfaces/async-static-provider';
import { AsyncValueMultiProvider } from '../interfaces/async-value-provider';

/**
 * Type guard to check if the provider is defined as multiple.
 */
export function isMultiProvider<T>(
  asyncStaticProvider: AsyncStaticProvider<T>
): asyncStaticProvider is AsyncValueMultiProvider<T[]> | AsyncClassMultiProvider<T[]> | AsyncFactoryMultiProvider<T[]> {
  return (asyncStaticProvider as any).multi === true;
}
