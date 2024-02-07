import { DefaultExport } from './default-export';

/**
 * Function that extracts the default export from a ES Module.
 *
 * @template T Type of the default export
 * @param {DefaultExport<T>} defaultExport Module export that can be either a symbol or a default export
 *
 * @example
 *
 * Imported file `file.ts`:
 * ```ts
 * const a = 'test';
 * export default a;
 * ```
 *
 * Usage of the default export:
 * ```ts
 * const b = extractDefaultExport(await import('./file.ts')); // b = 100
 * ```
 */
export function extractDefaultExport<T>(defaultExport: DefaultExport<T>): T {
  return isDefaultExport(defaultExport) ? defaultExport.default : defaultExport;
}

/**
 * @ignore
 */
function isDefaultExport<T>(defaultExport: DefaultExport<T>): defaultExport is { default: T } {
  return (defaultExport as any).default != null;
}
