import { DefaultExport } from '../types/default-export';

/**
 * @private
 */
export function extractDefaultExport<T>(defaultExport: DefaultExport<T>): T {
  return isDefaultExport(defaultExport) ? defaultExport.default : defaultExport;
}

function isDefaultExport<T>(defaultExport: DefaultExport<T>): defaultExport is { default: T } {
  return (defaultExport as any).default != null;
}
