/**
 * An ES Module object with a default export of the given type.
 * Default exports are bound under the name "default", per the ES Module spec:
 * https://tc39.es/ecma262/#table-export-forms-mapping-to-exportentry-records
 */
export type DefaultExport<T> = T | { default: T };
