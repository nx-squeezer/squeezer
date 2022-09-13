/**
 * Provides a mechanism to use dynamic import / import() with tsconfig -> module: commonJS as otherwise import() gets
 * transpiled to require().
 *
 * https://github.com/microsoft/TypeScript/issues/43329
 * https://github.com/typhonjs-oclif-scratch/core-esm/blob/master/src/module-loader.ts
 */
const importDynamic = new Function('modulePath', `return import(modulePath)`); // eslint-disable-line no-new-func

const importCache = new Map<string, any>();

// https://redfin.engineering/node-modules-at-war-why-commonjs-and-es-modules-cant-get-along-9617135eeca1
export async function importEsm<T = any>(path: string): Promise<T> {
  if (!importCache.has(path)) {
    let esm = await importDynamic(path);
    if (esm.default) {
      esm = esm.default;
    }
    importCache.set(path, esm);
  }
  return importCache.get(path);
}
