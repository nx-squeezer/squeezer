import { effect } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MapSignal } from './map-signal';

interface Name {
  first: string;
  second: string;
}

describe('MapSignal', () => {
  let mapSignal: MapSignal<keyof Name, string>;

  beforeEach(() => {
    mapSignal = new MapSignal();
  });

  it('should create an instance', () => {
    expect(mapSignal).toBeTruthy();
  });

  it('should be empty', () => {
    expect(mapSignal.values()).toStrictEqual([]);
  });

  it('should notify when a value is added', () => {
    let value = mapSignal.values();
    TestBed.runInInjectionContext(() => {
      effect(() => (value = mapSignal.values()));
    });

    expect(value).toStrictEqual([]);

    mapSignal.set('first', 'first');

    TestBed.flushEffects();

    expect(value).toStrictEqual(['first']);
  });

  it('should notify when a value is deleted', () => {
    mapSignal.set('first', 'first');
    let value = mapSignal.values();
    TestBed.runInInjectionContext(() => {
      effect(() => (value = mapSignal.values()));
    });

    expect(value).toStrictEqual(['first']);

    mapSignal.delete('first');

    TestBed.flushEffects();

    expect(value).toStrictEqual([]);
  });

  it('should notify when cleared', () => {
    mapSignal.set('first', 'first');
    let value = mapSignal.values();
    TestBed.runInInjectionContext(() => {
      effect(() => (value = mapSignal.values()));
    });

    mapSignal.clear();

    TestBed.flushEffects();

    expect(value).toStrictEqual([]);
  });
});
