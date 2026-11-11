// Pages Chrome never lets an extension debug, whatever its permissions.
const RESTRICTED_PROTOCOLS: readonly string[] = [
  'chrome:',
  'chrome-untrusted:',
  'chrome-search:',
  'devtools:',
  'edge:',
  'brave:',
];

const isWebStoreUrl = ({ hostname, pathname }: URL): boolean =>
  hostname === 'chromewebstore.google.com' ||
  (hostname === 'chrome.google.com' && pathname.startsWith('/webstore'));

/**
 * Whether the URL is a browser page or the Chrome Web Store. An unknown URL
 * (not exposed to us, or unparsable) is not treated as restricted: the attach
 * attempt decides, see isRestrictedPageError.
 */
export const isRestrictedUrl = (url: string | undefined): boolean => {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return RESTRICTED_PROTOCOLS.includes(parsed.protocol) || isWebStoreUrl(parsed);
  } catch {
    return false;
  }
};

// chrome.debugger.attach rejections for protected targets, e.g.
// "Cannot access a chrome:// URL" or "Cannot attach to this target."
const RESTRICTED_ERROR_PATTERN = /cannot access|cannot attach to this target/i;

export const isRestrictedPageError = (error: unknown): boolean =>
  RESTRICTED_ERROR_PATTERN.test(
    error instanceof Error ? error.message : String(error)
  );
