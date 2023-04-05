import { areSetsEqual, getSet, removeDuplicates } from './set';

describe('@nx-squeezer/devkit set functions', () => {
  describe('areSetsEqual', () => {
    it('should consider sets equal', () => {
      expect(areSetsEqual(new Set([1, 1, 2, 3]), new Set([1, 2, 3]))).toBeTruthy();
    });

    it('should consider sets different', () => {
      expect(areSetsEqual(new Set([1, 1, 2, 3]), new Set([1, 2]))).toBeFalsy();
    });
  });

  describe('getSet', () => {
    it('create a set from an array', () => {
      expect(getSet([1, 2]).size).toBe(2);
    });

    it('create a set from a single element', () => {
      expect(getSet(1).size).toBe(1);
    });
  });

  describe('removeDuplicates', () => {
    it('should remove duplicates from an array', () => {
      expect(removeDuplicates([1, 1, 2])).toStrictEqual([1, 2]);
    });
  });
});
