/**
 * Checks whether a control can be disabled based on its type.
 */
export type DisabledType<T> = T extends undefined ? boolean : false;

/**
 * Checks whether a control can be enabled based on its type.
 */
export type EnabledType<T> = T extends undefined ? boolean : true;
