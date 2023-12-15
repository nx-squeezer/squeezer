import { performance } from 'perf_hooks';

globalThis.performance = performance as any;
globalThis.performance.mark = jest.fn();
globalThis.performance.measure = jest.fn();
