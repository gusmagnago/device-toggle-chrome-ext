import { describe, expect, it } from 'vitest';
import { createToggleMessage, isToggleMessage } from './messages';

describe('isToggleMessage', () => {
  it('accepts messages built by createToggleMessage', () => {
    expect(isToggleMessage(createToggleMessage(3))).toBe(true);
  });

  it.each([
    null,
    undefined,
    'TOGGLE_EMULATION',
    { type: 'TOGGLE_EMULATION' },
    { type: 'TOGGLE_EMULATION', tabId: '3' },
    { type: 'SOMETHING_ELSE', tabId: 3 },
  ])('rejects %j', (value) => {
    expect(isToggleMessage(value)).toBe(false);
  });
});
