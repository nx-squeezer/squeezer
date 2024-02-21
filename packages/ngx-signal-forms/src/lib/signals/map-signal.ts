import { Signal, computed, signal } from '@angular/core';

/**
 * Reactive Map.
 */
export class MapSignal<T extends object, V> {
  /**
   * @internal
   */
  private readonly map = new Map<keyof T, V>();

  /**
   * @internal
   */
  private readonly changes = signal({});

  /**
   * @internal
   */
  private notifyChanges() {
    this.changes.set({});
  }

  /**
   * Removes all items from the map
   */
  clear(): void {
    this.map.clear();
    this.notifyChanges();
  }

  /**
   * Returns true if an element in the Map existed and has been removed, or false if the element does not exist.
   */
  delete(key: keyof T): boolean {
    const result = this.map.delete(key);
    this.notifyChanges();
    return result;
  }

  /**
   * Adds a new element with a specified key and value to the Map. If an element with the same key already exists, the element will be updated.
   */
  set(key: keyof T, value: V): void {
    this.map.set(key, value);
    this.notifyChanges();
  }

  /**
   * Reactive value that returns all the values in the map and  notifies consumers of any changes.
   */
  readonly values: Signal<readonly Readonly<V>[]> = computed((): readonly Readonly<V>[] => {
    this.changes();
    return [...this.map.values()];
  });
}
