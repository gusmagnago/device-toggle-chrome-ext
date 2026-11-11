import { useCallback, useEffect, useState } from 'react';
import { createToggleMessage } from '../shared/messages';
import {
  DEFAULT_TAB_STATE,
  parseTabState,
  tabStateKey,
  type TabState,
} from '../shared/tabState';

interface TabEmulation {
  state: TabState;
  toggle: () => Promise<void>;
}

const FAILED_STATE: TabState = { isMobile: false, error: 'unknown' };

const getActiveTabId = async (): Promise<number | null> => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return typeof tab?.id === 'number' ? tab.id : null;
};

/**
 * Mirrors the active tab's emulation state, which is owned by the background
 * service worker. The popup never talks to chrome.debugger itself.
 */
export const useTabEmulation = (): TabEmulation => {
  const [tabId, setTabId] = useState<number | null>(null);
  const [state, setState] = useState<TabState>(DEFAULT_TAB_STATE);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      try {
        const activeTabId = await getActiveTabId();
        if (activeTabId === null) throw new Error('No active tab');

        const key = tabStateKey(activeTabId);
        const stored = await chrome.storage.session.get(key);
        if (isCancelled) return;

        setTabId(activeTabId);
        setState(parseTabState(stored[key]));
      } catch (error) {
        console.error('Device Toggle: could not read tab state', error);
        if (!isCancelled) setState(FAILED_STATE);
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Stay in sync when the state changes behind our back, e.g. the user
  // dismisses the debugger infobar while the popup is open.
  useEffect(() => {
    if (tabId === null) return;

    const key = tabStateKey(tabId);
    const handleChange = (changes: {
      [name: string]: chrome.storage.StorageChange;
    }) => {
      if (key in changes) setState(parseTabState(changes[key].newValue));
    };

    chrome.storage.session.onChanged.addListener(handleChange);
    return () => chrome.storage.session.onChanged.removeListener(handleChange);
  }, [tabId]);

  const toggle = useCallback(async () => {
    if (tabId === null) {
      setState(FAILED_STATE);
      return;
    }

    try {
      const response: unknown = await chrome.runtime.sendMessage(
        createToggleMessage(tabId)
      );
      setState(parseTabState(response));
    } catch (error) {
      console.error('Device Toggle: toggle request failed', error);
      setState((current) => ({ ...current, error: 'unknown' }));
    }
  }, [tabId]);

  return { state, toggle };
};
