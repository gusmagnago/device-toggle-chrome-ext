import { describe, expect, it } from 'vitest';
import {
  DEFAULT_TAB_STATE,
  isDefaultTabState,
  parseTabState,
  tabStateKey,
} from './tabState';

describe('tabStateKey', () => {
  it('builds a distinct key per tab', () => {
    expect(tabStateKey(42)).toBe('tab:42');
    expect(tabStateKey(1)).not.toBe(tabStateKey(11));
  });
});

describe('parseTabState', () => {
  it('returns the stored state when it is valid', () => {
    expect(parseTabState({ isMobile: true, error: null })).toEqual({
      isMobile: true,
      error: null,
    });
    expect(parseTabState({ isMobile: false, error: 'restricted' })).toEqual({
      isMobile: false,
      error: 'restricted',
    });
  });

  it.each([undefined, null, 'mobile', 7, []])(
    'falls back to the default state for %j',
    (value) => {
      expect(parseTabState(value)).toEqual(DEFAULT_TAB_STATE);
    }
  );

  it('drops unknown fields and invalid values', () => {
    expect(parseTabState({ isMobile: 'yes', error: 'boom', extra: 1 })).toEqual(
      DEFAULT_TAB_STATE
    );
  });
});

describe('isDefaultTabState', () => {
  it('is true only for desktop mode without an error', () => {
    expect(isDefaultTabState({ isMobile: false, error: null })).toBe(true);
    expect(isDefaultTabState({ isMobile: true, error: null })).toBe(false);
    expect(isDefaultTabState({ isMobile: false, error: 'unknown' })).toBe(false);
  });
});
