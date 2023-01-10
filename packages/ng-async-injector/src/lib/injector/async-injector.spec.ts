import { InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { provideAsyncInjector } from '../providers/provide-async-injector.function';
import { provideAsync } from '../providers/provide-async.function';
import { AsyncInjector } from './async-injector';

describe('AsyncInjector', () => {
  const BOOLEAN_INJECTOR_TOKEN = new InjectionToken<boolean>('boolean');
  const booleanAsyncFactory = () => Promise.resolve(true);

  const NUMBER_INJECTOR_TOKEN = new InjectionToken<number>('number');
  const numberAsyncFactory = () => Promise.resolve(1);

  describe('injector', () => {
    it('should resolve async injection tokens by providing async injector', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideAsyncInjector(),
          provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useValueFactory: booleanAsyncFactory }),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN);

      expect(TestBed.inject(BOOLEAN_INJECTOR_TOKEN)).toBeTruthy();
    });

    it('should resolve async injection tokens by lazy loading async injector', async () => {
      TestBed.configureTestingModule({
        providers: [provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useValueFactory: booleanAsyncFactory })],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN);

      expect(TestBed.inject(BOOLEAN_INJECTOR_TOKEN)).toBeTruthy();
    });
  });

  describe('provide single injection token', () => {
    it('should fail injection if async injection token not resolved', () => {
      TestBed.configureTestingModule({
        providers: [provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useValueFactory: booleanAsyncFactory })],
      });

      expect(() => {
        TestBed.inject(BOOLEAN_INJECTOR_TOKEN);
      }).toThrowError('InjectionToken boolean not yet resolved.');
    });

    it('should fail injection if async injection token not registered', () => {
      TestBed.configureTestingModule({});

      const asyncInjector = TestBed.inject(AsyncInjector);

      expect(() => {
        asyncInjector.get(BOOLEAN_INJECTOR_TOKEN);
      }).toThrowError('InjectionToken boolean not provided.');

      expect(() => {
        asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN);
      }).toThrowError('InjectionToken boolean not provided.');
    });

    it('should resolve the factory only once', async () => {
      let resolve: Function = () => void {};

      TestBed.configureTestingModule({
        providers: [
          provideAsync({
            provide: BOOLEAN_INJECTOR_TOKEN,
            useValueFactory: () => new Promise((resolveCallback) => (resolve = resolveCallback)),
          }),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);

      expect(asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN)).toBe(asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN));

      resolve();
    });

    it('should fail injection if async injection token rejects', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let reject: Function = (_: string) => void {};

      TestBed.configureTestingModule({
        providers: [
          provideAsync({
            provide: BOOLEAN_INJECTOR_TOKEN,
            useValueFactory: () => new Promise((_, rejectCallback) => (reject = rejectCallback)),
          }),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);

      const promise = asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN);
      reject('failure');

      await expect(promise).rejects.toEqual(new Error(`InjectionToken boolean failed resolution: failure`));
      expect(() => {
        asyncInjector.get(BOOLEAN_INJECTOR_TOKEN);
      }).toThrowError('InjectionToken boolean failed during its resolution.');
    });
  });

  describe('provide multiple injection token', () => {
    it('should resolve async injection token', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideAsync(
            { provide: BOOLEAN_INJECTOR_TOKEN, useValueFactory: booleanAsyncFactory },
            { provide: NUMBER_INJECTOR_TOKEN, useValueFactory: numberAsyncFactory }
          ),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      const booleanValue: boolean = await asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN);
      const numberValue: number = await asyncInjector.resolve(NUMBER_INJECTOR_TOKEN);

      expect(booleanValue).toBeTruthy();
      expect(numberValue).toBe(1);
      expect(TestBed.inject(BOOLEAN_INJECTOR_TOKEN)).toBeTruthy();
      expect(TestBed.inject(NUMBER_INJECTOR_TOKEN)).toBe(1);
    });
  });

  describe('injection mode', () => {
    it('should resolve async injection if when mode is eager', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useValueFactory: booleanAsyncFactory, mode: 'eager' }),
        ],
      });

      // Force environment to initialize and wait for macrotask so that promise is resolved
      TestBed.inject(AsyncInjector);
      await flushPromises();

      expect(TestBed.inject(BOOLEAN_INJECTOR_TOKEN)).toBeTruthy();
    });
  });

  describe('resolve', () => {
    it('should resolve all async injection tokens', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideAsync(
            { provide: BOOLEAN_INJECTOR_TOKEN, useValueFactory: booleanAsyncFactory },
            { provide: NUMBER_INJECTOR_TOKEN, useValueFactory: numberAsyncFactory }
          ),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN);
      await asyncInjector.resolveAll();

      expect(TestBed.inject(BOOLEAN_INJECTOR_TOKEN)).toBeTruthy();
      expect(TestBed.inject(NUMBER_INJECTOR_TOKEN)).toBe(1);
    });

    it('should resolve multiple async injection tokens from a collection', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideAsync(
            { provide: BOOLEAN_INJECTOR_TOKEN, useValueFactory: booleanAsyncFactory },
            { provide: NUMBER_INJECTOR_TOKEN, useValueFactory: numberAsyncFactory }
          ),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      const [booleanValue, numberValue]: [boolean, number] = await asyncInjector.resolveMany(
        BOOLEAN_INJECTOR_TOKEN,
        NUMBER_INJECTOR_TOKEN
      );

      expect(booleanValue).toBeTruthy();
      expect(numberValue).toBe(1);
      expect(TestBed.inject(BOOLEAN_INJECTOR_TOKEN)).toBeTruthy();
      expect(TestBed.inject(NUMBER_INJECTOR_TOKEN)).toBe(1);
    });

    it('should fail when resolving multiple async injection tokens if none provided from a collection', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideAsync(
            { provide: BOOLEAN_INJECTOR_TOKEN, useValueFactory: booleanAsyncFactory },
            { provide: NUMBER_INJECTOR_TOKEN, useValueFactory: numberAsyncFactory }
          ),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      expect(() => asyncInjector.resolveMany()).toThrowError(
        'Provide at least one injection token to be resolved when calling resolveMany().'
      );
    });

    it('should resolve multiple async injection tokens from a map', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideAsync(
            { provide: BOOLEAN_INJECTOR_TOKEN, useValueFactory: booleanAsyncFactory },
            { provide: NUMBER_INJECTOR_TOKEN, useValueFactory: numberAsyncFactory }
          ),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      const { booleanValue, numberValue }: { booleanValue: boolean; numberValue: number } =
        await asyncInjector.resolveMany({
          booleanValue: BOOLEAN_INJECTOR_TOKEN,
          numberValue: NUMBER_INJECTOR_TOKEN,
        });

      expect(booleanValue).toBeTruthy();
      expect(numberValue).toBe(1);
      expect(TestBed.inject(BOOLEAN_INJECTOR_TOKEN)).toBeTruthy();
      expect(TestBed.inject(NUMBER_INJECTOR_TOKEN)).toBe(1);
    });
  });
});

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));
