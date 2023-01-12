import { inject, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { InjectionContext } from '../interfaces/injection-context';
import { provideAsyncInjector } from '../providers/provide-async-injector.function';
import { provideAsync } from '../providers/provide-async.function';
import { AsyncInjector } from './async-injector';

describe('AsyncInjector', () => {
  const BOOLEAN_INJECTOR_TOKEN = new InjectionToken<boolean>('boolean');
  const booleanAsyncValue = () => Promise.resolve(true);

  const NUMBER_INJECTOR_TOKEN = new InjectionToken<number>('number');
  const numberAsyncValue = () => Promise.resolve(1);

  const STRING_INJECTOR_TOKEN = new InjectionToken<string>('string');
  const stringAsyncValue = () => Promise.resolve('test');

  describe('injector', () => {
    it('should resolve async injection tokens by providing async injector', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideAsyncInjector(),
          provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue }),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN);

      expect(TestBed.inject(BOOLEAN_INJECTOR_TOKEN)).toBeTruthy();
    });

    it('should resolve async injection tokens by lazy loading async injector', async () => {
      TestBed.configureTestingModule({
        providers: [provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue })],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN);

      expect(TestBed.inject(BOOLEAN_INJECTOR_TOKEN)).toBeTruthy();
    });
  });

  describe('single injection token', () => {
    it('should fail injection if async injection token not resolved', () => {
      TestBed.configureTestingModule({
        providers: [provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue })],
      });

      expect(() => {
        TestBed.inject(BOOLEAN_INJECTOR_TOKEN);
      }).toThrowError('InjectionToken boolean not yet resolved.');
    });

    it('should fail injection if async injection token not registered', async () => {
      TestBed.configureTestingModule({});

      const asyncInjector = TestBed.inject(AsyncInjector);

      expect(() => asyncInjector.get(BOOLEAN_INJECTOR_TOKEN)).toThrowError('InjectionToken boolean not provided.');

      await expect(() => asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN)).rejects.toBe(
        'InjectionToken boolean not provided.'
      );
    });

    it('should resolve the factory only once', async () => {
      let resolve: Function = () => void {};

      TestBed.configureTestingModule({
        providers: [
          provideAsync({
            provide: BOOLEAN_INJECTOR_TOKEN,
            useAsyncValue: () => new Promise((resolveCallback) => (resolve = resolveCallback)),
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
            useAsyncValue: () => new Promise((_, rejectCallback) => (reject = rejectCallback)),
          }),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);

      const promise = asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN);
      reject('failure');

      await expect(promise).rejects.toEqual(`InjectionToken boolean failed resolution: failure`);
      expect(() => {
        asyncInjector.get(BOOLEAN_INJECTOR_TOKEN);
      }).toThrowError('InjectionToken boolean failed during its resolution.');
    });
  });

  describe('multiple injection token', () => {
    it('should resolve async injection token', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideAsync(
            { provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue },
            { provide: NUMBER_INJECTOR_TOKEN, useAsyncValue: numberAsyncValue }
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

  describe('resolve', () => {
    it('should resolve all async injection tokens', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideAsync(
            { provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue },
            { provide: NUMBER_INJECTOR_TOKEN, useAsyncValue: numberAsyncValue }
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
            { provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue },
            { provide: NUMBER_INJECTOR_TOKEN, useAsyncValue: numberAsyncValue }
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
            { provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue },
            { provide: NUMBER_INJECTOR_TOKEN, useAsyncValue: numberAsyncValue }
          ),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await expect(() => asyncInjector.resolveMany()).rejects.toBe(
        'Provide at least one injection token to be resolved when calling resolveMany().'
      );
    });

    it('should resolve multiple async injection tokens from a map', async () => {
      TestBed.configureTestingModule({
        providers: [
          provideAsync(
            { provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue },
            { provide: NUMBER_INJECTOR_TOKEN, useAsyncValue: numberAsyncValue }
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

  describe('injection mode', () => {
    it('should resolve async injection if when mode is eager', async () => {
      TestBed.configureTestingModule({
        providers: [provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue, mode: 'eager' })],
      });

      // Force environment to initialize and wait for macrotask so that promise is resolved
      TestBed.inject(AsyncInjector);
      await flushPromises();

      expect(TestBed.inject(BOOLEAN_INJECTOR_TOKEN)).toBeTruthy();
    });
  });

  describe('injection strategies', () => {
    it('should resolve async injection tokens using an async value', async () => {
      TestBed.configureTestingModule({
        providers: [provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: () => Promise.resolve(true) })],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN);

      expect(TestBed.inject(BOOLEAN_INJECTOR_TOKEN)).toBeTruthy();
    });

    it('should resolve async injection tokens using an async class', async () => {
      class TestClass {
        readonly booleanValue = inject(BOOLEAN_INJECTOR_TOKEN);
      }
      const CLASS_INJECTOR_TOKEN = new InjectionToken<TestClass>('class');

      TestBed.configureTestingModule({
        providers: [
          { provide: BOOLEAN_INJECTOR_TOKEN, useValue: true },
          provideAsync({ provide: CLASS_INJECTOR_TOKEN, useAsyncClass: () => Promise.resolve(TestClass) }),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await asyncInjector.resolve(CLASS_INJECTOR_TOKEN);

      expect(TestBed.inject(CLASS_INJECTOR_TOKEN)).toBeInstanceOf(TestClass);
      expect(TestBed.inject(CLASS_INJECTOR_TOKEN).booleanValue).toBeTruthy();
    });

    it('should resolve async injection tokens using an async factory', async () => {
      function factory(): number {
        return inject(BOOLEAN_INJECTOR_TOKEN) ? 1 : 0;
      }

      TestBed.configureTestingModule({
        providers: [
          { provide: BOOLEAN_INJECTOR_TOKEN, useValue: true },
          provideAsync({ provide: NUMBER_INJECTOR_TOKEN, useAsyncFactory: () => Promise.resolve(factory) }),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await asyncInjector.resolve(NUMBER_INJECTOR_TOKEN);

      expect(TestBed.inject(NUMBER_INJECTOR_TOKEN)).toBe(1);
    });

    it('should resolve async injection tokens using an async factory that returns a promise', async () => {
      async function factory(): Promise<number> {
        const booleanValue = inject(BOOLEAN_INJECTOR_TOKEN);
        await new Promise((resolve) => setTimeout(resolve, 0));
        return booleanValue ? 1 : 0;
      }

      TestBed.configureTestingModule({
        providers: [
          { provide: BOOLEAN_INJECTOR_TOKEN, useValue: true },
          provideAsync({ provide: NUMBER_INJECTOR_TOKEN, useAsyncFactory: () => Promise.resolve(factory) }),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await asyncInjector.resolve(NUMBER_INJECTOR_TOKEN);

      expect(TestBed.inject(NUMBER_INJECTOR_TOKEN)).toBe(1);
    });
  });

  describe('injection context', () => {
    it('should provide environment injection context to async factories', async () => {
      const factory = async ({ inject, resolve }: InjectionContext): Promise<number> => {
        const stringValue = await resolve(STRING_INJECTOR_TOKEN);
        const booleanValue = inject(BOOLEAN_INJECTOR_TOKEN);
        return booleanValue ? stringValue.length : 0;
      };

      TestBed.configureTestingModule({
        providers: [
          { provide: BOOLEAN_INJECTOR_TOKEN, useValue: true },
          provideAsync(
            { provide: STRING_INJECTOR_TOKEN, useAsyncValue: stringAsyncValue },
            { provide: NUMBER_INJECTOR_TOKEN, useAsyncFactory: () => Promise.resolve(factory) }
          ),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);
      await asyncInjector.resolve(NUMBER_INJECTOR_TOKEN);

      expect(TestBed.inject(NUMBER_INJECTOR_TOKEN)).toBe(4);
    });

    it('should fail when there are cyclic dependencies', async () => {
      const FIRST_INJECTOR_TOKEN = new InjectionToken<string>('first');
      const firstFactory = ({ resolve }: InjectionContext): Promise<string> => resolve(THIRD_INJECTOR_TOKEN);

      const SECOND_INJECTOR_TOKEN = new InjectionToken<string>('second');
      const secondFactory = ({ resolve }: InjectionContext): Promise<string> => resolve(FIRST_INJECTOR_TOKEN);

      const THIRD_INJECTOR_TOKEN = new InjectionToken<string>('third');
      const thirdFactory = async ({ resolve }: InjectionContext): Promise<string> => {
        await resolve(FOURTH_INJECTOR_TOKEN);
        return resolve(SECOND_INJECTOR_TOKEN);
      };

      const FOURTH_INJECTOR_TOKEN = new InjectionToken<string>('fourth');
      const fourthFactory = (): Promise<string> => Promise.resolve('fourth');

      TestBed.configureTestingModule({
        providers: [
          provideAsync(
            { provide: FIRST_INJECTOR_TOKEN, useAsyncFactory: () => Promise.resolve(firstFactory) },
            { provide: SECOND_INJECTOR_TOKEN, useAsyncFactory: () => Promise.resolve(secondFactory) },
            { provide: THIRD_INJECTOR_TOKEN, useAsyncFactory: () => Promise.resolve(thirdFactory) },
            { provide: FOURTH_INJECTOR_TOKEN, useAsyncFactory: () => Promise.resolve(fourthFactory) }
          ),
        ],
      });

      const asyncInjector = TestBed.inject(AsyncInjector);

      await expect(() => asyncInjector.resolve(FIRST_INJECTOR_TOKEN)).rejects.toStrictEqual(
        new Error(
          `Cyclic dependency on async providers: InjectionToken first -> InjectionToken third -> InjectionToken second -> InjectionToken first`
        )
      );
    });
  });
});

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));
