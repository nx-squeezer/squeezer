export function areSetsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  return a.size === b.size && [...a].every((value) => b.has(value));
}

export function getSet<T>(items: T | T[]): Set<T> {
  return new Set(Array.isArray(items) ? items : [items]);
}
