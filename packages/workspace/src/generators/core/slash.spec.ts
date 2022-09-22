import { slash } from './slash';

describe('@nx-squeezer/workspace slash', () => {
  it('convert backwards-slash paths to forward slash paths', () => {
    expect(slash('c:/aaaa\\bbbb')).toBe('c:/aaaa/bbbb');
    expect(slash('c:\\aaaa\\bbbb')).toBe('c:/aaaa/bbbb');
  });

  it('not convert extended-length paths', () => {
    const path = '\\\\?\\c:\\aaaa\\bbbb';
    expect(slash(path)).toBe(path);
  });

  it('not convert paths with Unicode', () => {
    const path = 'c:\\aaaa\\bbbb\\★';
    expect(slash(path)).toBe(path);
  });
});
