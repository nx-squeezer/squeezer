import { TestBed } from '@angular/core/testing';

import { provideAsyncInjector } from '../providers/provide-async-injector.function';
import { provideAsync } from '../providers/provide-async.function';
import { AsyncInjectionToken } from '../tokens/async-injection-token';
import { AsyncInjector } from './async-injector';

describe('AsyncInjector', () => {
  const ASYNC_INJECTOR_TOKEN = new AsyncInjectionToken<boolean>('name');
  const useAsyncFactory = () => Promise.resolve(true);

  describe('injector', () => {
    it('should resolve async injection tokens by providing async injector', async () => {
      TestBed.configureTestingModule({
        providers: [provideAsyncInjector(), provideAsync({ provide: ASYNC_INJECTOR_TOKEN, useAsyncFactory })],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await asyncInjector.resolve(ASYNC_INJECTOR_TOKEN);

      expect(TestBed.inject(ASYNC_INJECTOR_TOKEN)).toBeTruthy();
    });

    it('should resolve async injection tokens by lazy loading async injector', async () => {
      TestBed.configureTestingModule({
        providers: [provideAsync({ provide: ASYNC_INJECTOR_TOKEN, useAsyncFactory })],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await asyncInjector.resolve(ASYNC_INJECTOR_TOKEN);

      expect(TestBed.inject(ASYNC_INJECTOR_TOKEN)).toBeTruthy();
    });
  });

  describe('provide single injection token', () => {
    it('should fail injection if async injection token not resolved', () => {
      TestBed.configureTestingModule({
        providers: [provideAsync({ provide: ASYNC_INJECTOR_TOKEN, useAsyncFactory })],
      });

      expect(() => {
        TestBed.inject(ASYNC_INJECTOR_TOKEN);
      }).toThrowError('AsyncInjectionToken name not yet resolved.');
    });

    it('should fail injection if async injection token not registered', () => {
      TestBed.configureTestingModule({});

      const asyncInjector = TestBed.inject(AsyncInjector);

      expect(() => {
        asyncInjector.get(ASYNC_INJECTOR_TOKEN);
      }).toThrowError('AsyncInjectionToken name not provided.');

      expect(() => {
        asyncInjector.resolve(ASYNC_INJECTOR_TOKEN);
      }).toThrowError('AsyncInjectionToken name not provided.');
    });

    it('should resolve the factory only once', async () => {
      let resolve: Function = () => void {};

      TestBed.configureTestingModule({
        providers: [
          provideAsync({
            provide: ASYNC_INJECTOR_TOKEN,
            useAsyncFactory: () => new Promise((resolveCallback) => (resolve = resolveCallback)),
          }),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);

      expect(asyncInjector.resolve(ASYNC_INJECTOR_TOKEN)).toBe(asyncInjector.resolve(ASYNC_INJECTOR_TOKEN));

      resolve();
    });

    it('should fail injection if async injection token rejects', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let reject: Function = (_: string) => void {};

      TestBed.configureTestingModule({
        providers: [
          provideAsync({
            provide: ASYNC_INJECTOR_TOKEN,
            useAsyncFactory: () => new Promise((_, rejectCallback) => (reject = rejectCallback)),
          }),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);

      const promise = asyncInjector.resolve(ASYNC_INJECTOR_TOKEN);
      reject('failure');

      await expect(promise).rejects.toEqual(new Error(`AsyncInjectionToken name failed resolution: failure`));
      expect(() => {
        asyncInjector.get(ASYNC_INJECTOR_TOKEN);
      }).toThrowError('AsyncInjectionToken name failed during its resolution.');
    });
  });

  describe('provide multiple injection token', () => {
    it('should resolve async injection token', async () => {
      const SECOND_INJECTOR_TOKEN = new AsyncInjectionToken<number>('second');
      const secondAsyncFactory = () => Promise.resolve(1);

      TestBed.configureTestingModule({
        providers: [
          provideAsync([
            { provide: ASYNC_INJECTOR_TOKEN, useAsyncFactory },
            { provide: SECOND_INJECTOR_TOKEN, useAsyncFactory: secondAsyncFactory },
          ]),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await asyncInjector.resolve(ASYNC_INJECTOR_TOKEN);
      await asyncInjector.resolve(SECOND_INJECTOR_TOKEN);

      expect(TestBed.inject(ASYNC_INJECTOR_TOKEN)).toBeTruthy();
      expect(TestBed.inject(SECOND_INJECTOR_TOKEN)).toBe(1);
    });
  });

  describe('injection mode', () => {
    it('should resolve async injection if when mode is eager', async () => {
      TestBed.configureTestingModule({
        providers: [provideAsync({ provide: ASYNC_INJECTOR_TOKEN, useAsyncFactory, mode: 'eager' })],
      });

      // Force environment to initialize and wait for macrotask so that promise is resolved
      TestBed.inject(AsyncInjector);
      await flushPromises();

      expect(TestBed.inject(ASYNC_INJECTOR_TOKEN)).toBeTruthy();
    });
  });
});

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));
