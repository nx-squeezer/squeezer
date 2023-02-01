import {
  EnvironmentInjector,
  inject,
  InjectionToken,
  createEnvironmentInjector,
  Injector,
  Component,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AsyncInjector } from './async-injector';
import { ResolveAsyncProvidersDirective } from '../directives/resolve-async-providers.directive';
import { resolve } from '../functions/resolve';
import { resolveMany } from '../functions/resolve-many';
import { InjectionContext } from '../interfaces/injection-context';
import { provideAsync } from '../providers/provide-async.function';

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
      TestBed.configureTestingModule({ providers: [provideAsync()] });

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

    it('should fail when registering token if duplicated', () => {
      TestBed.configureTestingModule({
        providers: [
          provideAsync(
            { provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue },
            { provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue }
          ),
        ],
      });

      expect(() => {
        TestBed.inject(BOOLEAN_INJECTOR_TOKEN);
      }).toThrowError('InjectionToken boolean already provided.');
    });
  });

  describe('additional injection tokens', () => {
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

    it('should provide environment injection context to async factories through global resolve', async () => {
      const factory = async (): Promise<number> => {
        const stringValue = await resolve(STRING_INJECTOR_TOKEN);
        return stringValue.length;
      };

      TestBed.configureTestingModule({
        providers: [
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

    it('should provide environment injection context to async factories through global resolveMany', async () => {
      const factory = async (): Promise<number> => {
        const [stringValue] = await resolveMany(STRING_INJECTOR_TOKEN);
        return stringValue.length;
      };

      TestBed.configureTestingModule({
        providers: [
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
  });

  describe('hierarchical injectors', () => {
    it('should resolve injection tokens from parent async injector', async () => {
      TestBed.configureTestingModule({
        providers: [provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue })],
      });

      const rootEnvInjector = TestBed.inject(EnvironmentInjector);
      const rootAsyncInjector = rootEnvInjector.get(AsyncInjector);

      const childEnvInjector = createEnvironmentInjector([provideAsync()], rootEnvInjector);
      const childAsyncInjector = childEnvInjector.get(AsyncInjector);

      await childAsyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN);

      expect(rootAsyncInjector).not.toBe(childAsyncInjector);
      expect(childAsyncInjector.get(BOOLEAN_INJECTOR_TOKEN)).toBeTruthy();
    });

    it('should resolve all tokens from parent async injector', async () => {
      TestBed.configureTestingModule({
        providers: [provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue })],
      });

      const rootEnvInjector = TestBed.inject(EnvironmentInjector);
      const rootAsyncInjector = rootEnvInjector.get(AsyncInjector);

      const childEnvInjector = createEnvironmentInjector([provideAsync()], rootEnvInjector);
      const childAsyncInjector = childEnvInjector.get(AsyncInjector);

      await childAsyncInjector.resolveAll();

      expect(rootAsyncInjector).not.toBe(childAsyncInjector);
      expect(childAsyncInjector.get(BOOLEAN_INJECTOR_TOKEN)).toBeTruthy();
    });

    it('should resolve injection tokens from child async injector', async () => {
      TestBed.configureTestingModule({
        providers: [provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue })],
      });

      const rootEnvInjector = TestBed.inject(EnvironmentInjector);
      const rootAsyncInjector = rootEnvInjector.get(AsyncInjector);

      const childEnvInjector = createEnvironmentInjector(
        [provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: () => Promise.resolve(false) })],
        rootEnvInjector
      );
      const childAsyncInjector = childEnvInjector.get(AsyncInjector);

      await childAsyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN);

      expect(rootAsyncInjector).not.toBe(childAsyncInjector);
      expect(childAsyncInjector.get(BOOLEAN_INJECTOR_TOKEN)).toBeFalsy();
    });
  });

  describe('initialization', () => {
    const asyncInjectorNotInitializedMsg = 'Async injection not yet initialized.';

    it('should not allow multiple initialization', () => {
      TestBed.configureTestingModule({ providers: [provideAsync()] });
      const asyncInjector = TestBed.inject(AsyncInjector);

      expect(() => asyncInjector.init()).toThrowError('Async injection token already initialized.');
    });

    it('should not allow resolving providers before it is initialized', async () => {
      const injector = Injector.create({ providers: [{ provide: AsyncInjector }] });
      const asyncInjector = injector.get(AsyncInjector);

      expect(() => asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN)).toThrowError(asyncInjectorNotInitializedMsg);
      expect(() => asyncInjector.resolveMany()).toThrowError(asyncInjectorNotInitializedMsg);
      await expect(() => asyncInjector.resolveAll()).rejects.toEqual(new Error(asyncInjectorNotInitializedMsg));
    });

    it('should not allow getting providers before it is initialized', () => {
      const injector = Injector.create({ providers: [{ provide: AsyncInjector }] });
      const asyncInjector = injector.get(AsyncInjector);

      expect(() => asyncInjector.get(BOOLEAN_INJECTOR_TOKEN)).toThrowError(asyncInjectorNotInitializedMsg);
    });
  });

  describe('teardown', () => {
    const asyncInjectorDestroyedMsg = 'Async injection token already destroyed.';

    it('should not allow registering providers after it is destroyed', () => {
      TestBed.configureTestingModule({ providers: [provideAsync()] });

      const asyncInjector = TestBed.inject(AsyncInjector);
      TestBed.resetTestingModule();

      expect(() =>
        asyncInjector.init({ provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue })
      ).toThrowError(asyncInjectorDestroyedMsg);
    });

    it('should not allow resolving providers after it is destroyed', async () => {
      TestBed.configureTestingModule({ providers: [provideAsync()] });

      const asyncInjector = TestBed.inject(AsyncInjector);
      TestBed.resetTestingModule();

      expect(() => asyncInjector.resolve(BOOLEAN_INJECTOR_TOKEN)).toThrowError(asyncInjectorDestroyedMsg);
      expect(() => asyncInjector.resolveMany()).toThrowError(asyncInjectorDestroyedMsg);
      await expect(() => asyncInjector.resolveAll()).rejects.toEqual(new Error(asyncInjectorDestroyedMsg));
    });

    it('should not allow getting providers after it is destroyed', () => {
      TestBed.configureTestingModule({ providers: [provideAsync()] });

      const asyncInjector = TestBed.inject(AsyncInjector);
      TestBed.resetTestingModule();

      expect(() => asyncInjector.get(BOOLEAN_INJECTOR_TOKEN)).toThrowError(asyncInjectorDestroyedMsg);
    });
  });

  describe('provide in component', () => {
    it('should not init the async injector automatically', async () => {
      @Component({
        template: ``,
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: true,
        providers: [provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue })],
      })
      class TestComponent {
        readonly asyncInjector = inject(AsyncInjector);
      }

      await TestBed.configureTestingModule({ imports: [TestComponent] }).compileComponents();
      const fixture = TestBed.createComponent(TestComponent);

      expect(fixture.componentInstance.asyncInjector).toBeTruthy();
      expect(() => fixture.componentInstance.asyncInjector.init()).not.toThrow();
    });

    it('should fail if trying to inject an async provider in a component before resolution', async () => {
      @Component({
        template: ``,
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: true,
        providers: [provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue })],
      })
      class TestComponent {
        readonly booleanValue = inject(BOOLEAN_INJECTOR_TOKEN);
      }

      await TestBed.configureTestingModule({ imports: [TestComponent] }).compileComponents();

      expect(() => TestBed.createComponent(TestComponent)).toThrowError(/Use directive \*ngxResolveAsyncProviders/);
    });

    it('should init the async injector when using the directive', async () => {
      @Component({
        selector: `ngx-child`,
        template: ``,
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: true,
      })
      class ChildComponent {
        readonly booleanValue = inject(BOOLEAN_INJECTOR_TOKEN);
      }

      @Component({
        template: `<ngx-child #child *ngxResolveAsyncProviders />`,
        imports: [ChildComponent, ResolveAsyncProvidersDirective],
        changeDetection: ChangeDetectionStrategy.OnPush,
        standalone: true,
        providers: [provideAsync({ provide: BOOLEAN_INJECTOR_TOKEN, useAsyncValue: booleanAsyncValue })],
      })
      class ParentComponent {
        @ViewChild(ChildComponent) child!: ChildComponent;
        readonly asyncInjector = inject(AsyncInjector);
      }

      await TestBed.configureTestingModule({ imports: [ParentComponent] }).compileComponents();
      const fixture = TestBed.createComponent(ParentComponent);
      fixture.autoDetectChanges();

      await fixture.whenStable();

      expect(fixture.componentInstance.child).toBeTruthy();
    });
  });
});

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));
