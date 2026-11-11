export type TabErrorCode = 'unknown';

export interface TabState {
  /** Whether the mobile viewport override is currently applied to the tab. */
  isMobile: boolean;
  /** Outcome of the last action on the tab; null after a successful one. */
  error: TabErrorCode | null;
}

export const DEFAULT_TAB_STATE: TabState = { isMobile: false, error: null };

const ERROR_CODES: readonly TabErrorCode[] = ['unknown'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isErrorCode = (value: unknown): value is TabErrorCode =>
  ERROR_CODES.some((code) => code === value);

/** chrome.storage.session key holding the state of a single tab. */
export const tabStateKey = (tabId: number): string => `tab:${tabId}`;

/** Normalises whatever is in storage into a valid TabState. */
export const parseTabState = (value: unknown): TabState => {
  if (!isRecord(value)) return DEFAULT_TAB_STATE;

  return {
    isMobile: value.isMobile === true,
    error: isErrorCode(value.error) ? value.error : null,
  };
};

export const isDefaultTabState = (state: TabState): boolean =>
  !state.isMobile && state.error === null;
