/**
 * Calculates a circular dependency chain. Pre-requisite: provide the first element of the chain.
 * @private
 */
export function calculateCircularDependencyChain<T>(dependencyMap: Map<T, T[]>, chain: T[]): T[] | null {
  const firstNode = chain[0];
  const lastNode = chain[chain.length - 1];

  const childNodes = dependencyMap.get(lastNode);
  if (childNodes == null) {
    return null;
  }

  for (let index = 0; index < childNodes.length; index++) {
    const childNode = childNodes[index];
    const newChain = [...chain, childNode];
    if (childNode === firstNode) {
      return newChain;
    }

    const childChain = calculateCircularDependencyChain(dependencyMap, newChain);
    if (childChain != null) {
      return childChain;
    }
  }

  return null;
}
