import { joinNormalize } from './join-normalize';

describe('@nx-squeezer/workspace joinNormalize', () => {
  it('convert backwards-slash paths to forward slash paths', () => {
    expect(joinNormalize('c:/aaaa', 'bbbb')).toBe('c:/aaaa/bbbb');
    expect(joinNormalize('c:\\aaaa', 'bbbb')).toBe('c:/aaaa/bbbb');
  });
});
