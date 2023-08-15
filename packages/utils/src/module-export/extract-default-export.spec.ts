import { extractDefaultExport } from './extract-default-export';

describe('extractDefaultExport', () => {
  it('should unwrap default exports', () => {
    expect(extractDefaultExport({ default: true })).toBe(true);
  });

  it('should pass through symbols', () => {
    expect(extractDefaultExport(true)).toBe(true);
  });
});
