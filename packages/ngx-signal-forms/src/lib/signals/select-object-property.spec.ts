import { WritableSignal, signal } from '@angular/core';

import { selectObjectProperty } from './select-object-property';

interface Name {
  firstName: string;
}

const firstName = 'firstName';
const newName = 'newName';

describe('selectObjectProperty', () => {
  let writableSignal: WritableSignal<Name>;
  let firstNameSignal: WritableSignal<string>;

  beforeEach(() => {
    writableSignal = signal({ firstName });
    firstNameSignal = selectObjectProperty(writableSignal, firstName);
  });

  it('should create an instance', () => {
    expect(firstNameSignal).toBeTruthy();
  });

  it('should read the property as a signal', () => {
    expect(firstNameSignal()).toBe(firstName);
  });

  it('should update the source signal with changes', () => {
    firstNameSignal.set(newName);

    expect(firstNameSignal()).toBe(newName);
    expect(writableSignal().firstName).toBe(newName);
  });

  it('should make immutable changes', () => {
    const originalName = writableSignal();

    firstNameSignal.set(newName);

    expect(writableSignal()).not.toBe(originalName);
  });

  it('should not make changes if value is the same', () => {
    const originalName = writableSignal();

    firstNameSignal.set(firstName);

    expect(writableSignal()).toBe(originalName);
  });
});
