import { isToggleMessage } from '../shared/messages';
import type { TabState } from '../shared/tabState';
import { createEmulationController } from './emulationController';

const controller = createEmulationController({
  debugger: {
    attach: (target, protocolVersion) =>
      chrome.debugger.attach(target, protocolVersion),
    detach: (target) => chrome.debugger.detach(target),
    sendCommand: (target, method, params) =>
      chrome.debugger.sendCommand(target, method, params),
  },
  storage: {
    get: (key) => chrome.storage.session.get(key),
    set: (items) => chrome.storage.session.set(items),
    remove: (key) => chrome.storage.session.remove(key),
  },
  getTabUrl: async (tabId) => (await chrome.tabs.get(tabId)).url,
});

const FAILED_STATE: TabState = { isMobile: false, error: 'unknown' };

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  if (!isToggleMessage(message)) return false;

  controller
    .toggle(message.tabId)
    .catch((error: unknown): TabState => {
      console.error('Device Toggle: could not persist tab state', error);
      return FAILED_STATE;
    })
    .then(sendResponse);

  // Keep the message channel open for the async response.
  return true;
});

chrome.debugger.onDetach.addListener((source) => {
  if (typeof source.tabId === 'number') void controller.handleDetach(source.tabId);
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void controller.handleTabRemoved(tabId);
});
