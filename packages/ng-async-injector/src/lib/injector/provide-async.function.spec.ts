import { TestBed } from '@angular/core/testing';

import { provideAsyncInjector } from '../providers/provide-async-injector.function';
import { provideAsync } from '../providers/provide-async.function';
import { AsyncInjectionToken } from '../tokens/async-injection-token';
import { AsyncInjector } from './async-injector';

describe('provideAsync', () => {
  const ASYNC_INJECTOR_TOKEN = new AsyncInjectionToken<boolean>('name');
  const asyncFactory = () => Promise.resolve(true);

  it('should resolve async injection tokens', async () => {
    TestBed.configureTestingModule({
      providers: [provideAsyncInjector(), provideAsync(ASYNC_INJECTOR_TOKEN, asyncFactory)],
    });

    const asyncInjector = TestBed.inject(AsyncInjector);
    await asyncInjector.resolve(ASYNC_INJECTOR_TOKEN);

    expect(TestBed.inject(ASYNC_INJECTOR_TOKEN)).toBeTruthy();
  });

  it('should fail injection if async injection token not resolved', () => {
    TestBed.configureTestingModule({
      providers: [provideAsyncInjector(), provideAsync(ASYNC_INJECTOR_TOKEN, asyncFactory)],
    });

    expect(() => {
      TestBed.inject(ASYNC_INJECTOR_TOKEN);
    }).toThrowError('AsyncInjectionToken name not yet resolved.');
  });

  it('should fail injection if async injection token not registered', () => {
    TestBed.configureTestingModule({
      providers: [provideAsyncInjector()],
    });

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
        provideAsyncInjector(),
        provideAsync(ASYNC_INJECTOR_TOKEN, () => new Promise((resolveCallback) => (resolve = resolveCallback))),
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
        provideAsyncInjector(),
        provideAsync(ASYNC_INJECTOR_TOKEN, () => new Promise((_, rejectCallback) => (reject = rejectCallback))),
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
