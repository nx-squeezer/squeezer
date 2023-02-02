export type ArrayItemType<Array extends unknown[]> = Array extends (infer Item)[] ? Item : never;
