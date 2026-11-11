import { isRestrictedPageError, isRestrictedUrl } from '../shared/restrictedPages';
import {
  isDefaultTabState,
  parseTabState,
  tabStateKey,
  type TabErrorCode,
  type TabState,
} from '../shared/tabState';

const PROTOCOL_VERSION = '1.3';

const MOBILE_METRICS = {
  width: 375,
  height: 600,
  deviceScaleFactor: 3,
  mobile: true,
  fitWindow: true,
};

interface DebuggerTarget {
  tabId: number;
}

/** The subset of chrome.debugger the controller depends on. */
export interface DebuggerPort {
  attach: (target: DebuggerTarget, protocolVersion: string) => Promise<void>;
  detach: (target: DebuggerTarget) => Promise<void>;
  sendCommand: (
    target: DebuggerTarget,
    method: string,
    params?: object
  ) => Promise<unknown>;
}

/** The subset of chrome.storage.session the controller depends on. */
export interface StoragePort {
  get: (key: string) => Promise<Record<string, unknown>>;
  set: (items: Record<string, unknown>) => Promise<void>;
  remove: (key: string) => Promise<void>;
}

export interface EmulationDeps {
  debugger: DebuggerPort;
  storage: StoragePort;
  /** Resolves to undefined when the URL is not exposed to the extension. */
  getTabUrl: (tabId: number) => Promise<string | undefined>;
}

export interface EmulationController {
  toggle: (tabId: number) => Promise<TabState>;
  handleDetach: (tabId: number) => Promise<void>;
  handleTabRemoved: (tabId: number) => Promise<void>;
}

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const isAlreadyAttachedError = (error: unknown): boolean =>
  /already attached/i.test(errorMessage(error));

export const isNotAttachedError = (error: unknown): boolean =>
  /not attached/i.test(errorMessage(error));

class RestrictedPageError extends Error {}

const toErrorCode = (error: unknown): TabErrorCode =>
  error instanceof RestrictedPageError || isRestrictedPageError(error)
    ? 'restricted'
    : 'unknown';

export const createEmulationController = ({
  debugger: debuggerPort,
  storage,
  getTabUrl,
}: EmulationDeps): EmulationController => {
  // Actions on the same tab run one at a time, so a quick double toggle or a
  // detach event landing mid-toggle cannot interleave reads and writes.
  const queues = new Map<number, Promise<unknown>>();

  const enqueue = <T>(tabId: number, task: () => Promise<T>): Promise<T> => {
    const run = (queues.get(tabId) ?? Promise.resolve()).then(task, task);
    const settled = run.catch(() => undefined);

    queues.set(tabId, settled);
    void settled.then(() => {
      if (queues.get(tabId) === settled) queues.delete(tabId);
    });

    return run;
  };

  const readState = async (tabId: number): Promise<TabState> => {
    const key = tabStateKey(tabId);
    const stored = await storage.get(key);
    return parseTabState(stored[key]);
  };

  const writeState = async (tabId: number, state: TabState): Promise<void> => {
    const key = tabStateKey(tabId);

    if (isDefaultTabState(state)) {
      await storage.remove(key);
      return;
    }

    await storage.set({ [key]: state });
  };

  const enableMobile = async (tabId: number): Promise<void> => {
    const target = { tabId };
    let attachedHere = true;

    // Fail fast with a specific reason when we can see the URL. When we
    // cannot, Chrome's own rejection of the attach is classified instead.
    const url = await getTabUrl(tabId).catch(() => undefined);
    if (isRestrictedUrl(url)) throw new RestrictedPageError(url);

    try {
      await debuggerPort.attach(target, PROTOCOL_VERSION);
    } catch (error) {
      // Our own session can outlive the stored state (e.g. storage was
      // cleared). Fall through: the command below only succeeds if the
      // existing session really is ours.
      if (!isAlreadyAttachedError(error)) throw error;
      attachedHere = false;
    }

    try {
      await debuggerPort.sendCommand(
        target,
        'Emulation.setDeviceMetricsOverride',
        MOBILE_METRICS
      );
    } catch (error) {
      // Do not leave a debugger session (and its infobar) behind.
      if (attachedHere) await debuggerPort.detach(target).catch(() => undefined);
      throw error;
    }
  };

  const disableMobile = async (tabId: number): Promise<void> => {
    const target = { tabId };

    try {
      await debuggerPort.sendCommand(
        target,
        'Emulation.clearDeviceMetricsOverride',
        {}
      );
      await debuggerPort.detach(target);
    } catch (error) {
      // Already detached means the override is already gone: nothing to undo.
      if (!isNotAttachedError(error)) throw error;
    }
  };

  const toggle = (tabId: number): Promise<TabState> =>
    enqueue(tabId, async () => {
      const current = await readState(tabId);
      let next: TabState;

      try {
        if (current.isMobile) {
          await disableMobile(tabId);
        } else {
          await enableMobile(tabId);
        }
        next = { isMobile: !current.isMobile, error: null };
      } catch (error) {
        const code = toErrorCode(error);
        if (code === 'unknown') {
          console.error('Device Toggle: emulation failed', error);
        }
        next = { ...current, error: code };
      }

      await writeState(tabId, next);
      return next;
    });

  // The debugger went away without us asking (infobar "Cancel", DevTools
  // taking over, tab crash): Chrome has already dropped the override.
  const handleDetach = (tabId: number): Promise<void> =>
    enqueue(tabId, async () => {
      const current = await readState(tabId);
      if (current.isMobile) await writeState(tabId, { ...current, isMobile: false });
    });

  const handleTabRemoved = (tabId: number): Promise<void> =>
    enqueue(tabId, () => storage.remove(tabStateKey(tabId)));

  return { toggle, handleDetach, handleTabRemoved };
};

