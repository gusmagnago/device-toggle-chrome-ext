import { describe, expect, it } from 'vitest';
import { isRestrictedPageError, isRestrictedUrl } from './restrictedPages';

describe('isRestrictedUrl', () => {
  it.each([
    'chrome://extensions',
    'chrome://newtab/',
    'devtools://devtools/bundled/inspector.html',
    'edge://settings',
    'https://chromewebstore.google.com/detail/device-toggle/abc',
    'https://chrome.google.com/webstore/category/extensions',
  ])('treats %s as restricted', (url) => {
    expect(isRestrictedUrl(url)).toBe(true);
  });

  it.each([
    'https://example.com/',
    'http://localhost:5173/',
    'https://chrome.google.com/intl/en/chrome/',
    'https://example.com/?next=chrome://settings',
    'about:blank',
  ])('treats %s as a regular page', (url) => {
    expect(isRestrictedUrl(url)).toBe(false);
  });

  it.each([undefined, '', 'not a url'])(
    'does not flag an unknown URL (%j)',
    (url) => {
      expect(isRestrictedUrl(url)).toBe(false);
    }
  );
});

describe('isRestrictedPageError', () => {
  it.each([
    'Cannot access a chrome:// URL',
    'Cannot access a chrome-extension:// URL of different extension',
    'Cannot attach to this target.',
  ])('recognises "%s"', (message) => {
    expect(isRestrictedPageError(new Error(message))).toBe(true);
  });

  it('ignores unrelated failures', () => {
    expect(isRestrictedPageError(new Error('No tab with given id 1.'))).toBe(false);
    expect(isRestrictedPageError('Debugger is not attached')).toBe(false);
  });
});
