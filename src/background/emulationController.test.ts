import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tabStateKey } from '../shared/tabState';
import {
  createEmulationController,
  type EmulationDeps,
} from './emulationController';

const TAB_ID = 7;
const KEY = tabStateKey(TAB_ID);

const NOT_ATTACHED = `Debugger is not attached to the tab with id: ${TAB_ID}.`;
const ALREADY_ATTACHED = `Another debugger is already attached to the tab with id: ${TAB_ID}.`;

/** In-memory stand-ins for chrome.debugger, chrome.storage.session and chrome.tabs. */
const createFakeChrome = (initial: Record<string, unknown> = {}) => {
  const store = new Map<string, unknown>(Object.entries(initial));
  const attached = new Set<number>();

  const deps = {
    debugger: {
      attach: vi.fn(async ({ tabId }: { tabId: number }) => {
        if (attached.has(tabId)) throw new Error(ALREADY_ATTACHED);
        attached.add(tabId);
      }),
      detach: vi.fn(async ({ tabId }: { tabId: number }) => {
        if (!attached.delete(tabId)) throw new Error(NOT_ATTACHED);
      }),
      sendCommand: vi.fn(
        async ({ tabId }: { tabId: number }, method: string, params?: object) => {
          void method;
          void params;
          if (!attached.has(tabId)) throw new Error(NOT_ATTACHED);
          return {};
        }
      ),
    },
    storage: {
      get: vi.fn(async (key: string) =>
        store.has(key) ? { [key]: store.get(key) } : {}
      ),
      set: vi.fn(async (items: Record<string, unknown>) => {
        Object.entries(items).forEach(([key, value]) => store.set(key, value));
      }),
      remove: vi.fn(async (key: string) => {
        store.delete(key);
      }),
    },
    getTabUrl: vi.fn(
      async (tabId: number): Promise<string | undefined> => {
        void tabId;
        return 'https://example.com/';
      }
    ),
  } satisfies EmulationDeps;

  return { deps, store, attached };
};

describe('createEmulationController', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  describe('toggle', () => {
    it('attaches, applies the mobile override and stores the state', async () => {
      const { deps, store, attached } = createFakeChrome();
      const controller = createEmulationController(deps);

      const state = await controller.toggle(TAB_ID);

      expect(state).toEqual({ isMobile: true, error: null });
      expect(store.get(KEY)).toEqual({ isMobile: true, error: null });
      expect(attached.has(TAB_ID)).toBe(true);
      expect(deps.debugger.attach).toHaveBeenCalledWith({ tabId: TAB_ID }, '1.3');
      expect(deps.debugger.sendCommand).toHaveBeenCalledWith(
        { tabId: TAB_ID },
        'Emulation.setDeviceMetricsOverride',
        { width: 375, height: 600, deviceScaleFactor: 3, mobile: true }
      );
    });

    it('does not re-attach when toggled again: it clears the override and detaches', async () => {
      const { deps, store, attached } = createFakeChrome();

      // A second controller stands for the popup being reopened, or the
      // service worker restarting: nothing is carried over in memory.
      await createEmulationController(deps).toggle(TAB_ID);
      const state = await createEmulationController(deps).toggle(TAB_ID);

      expect(state).toEqual({ isMobile: false, error: null });
      expect(deps.debugger.attach).toHaveBeenCalledTimes(1);
      expect(deps.debugger.sendCommand).toHaveBeenLastCalledWith(
        { tabId: TAB_ID },
        'Emulation.clearDeviceMetricsOverride',
        {}
      );
      expect(attached.has(TAB_ID)).toBe(false);
      expect(store.has(KEY)).toBe(false);
    });

    it('keeps the state of each tab separate', async () => {
      const { deps, store } = createFakeChrome();
      const controller = createEmulationController(deps);

      await controller.toggle(1);
      await controller.toggle(2);
      await controller.toggle(1);

      expect(store.has(tabStateKey(1))).toBe(false);
      expect(store.get(tabStateKey(2))).toEqual({ isMobile: true, error: null });
    });

    it('runs concurrent toggles on the same tab one after the other', async () => {
      const { deps, store, attached } = createFakeChrome();
      const controller = createEmulationController(deps);

      const states = await Promise.all([
        controller.toggle(TAB_ID),
        controller.toggle(TAB_ID),
        controller.toggle(TAB_ID),
      ]);

      expect(states.map(({ isMobile }) => isMobile)).toEqual([true, false, true]);
      expect(states.every(({ error }) => error === null)).toBe(true);
      expect(store.get(KEY)).toEqual({ isMobile: true, error: null });
      expect(attached.has(TAB_ID)).toBe(true);
    });

    it('records an error, keeps desktop mode and detaches when the override fails', async () => {
      const { deps, store, attached } = createFakeChrome();
      deps.debugger.sendCommand.mockRejectedValueOnce(new Error('Target crashed'));

      const state = await createEmulationController(deps).toggle(TAB_ID);

      expect(state).toEqual({ isMobile: false, error: 'unknown' });
      expect(store.get(KEY)).toEqual({ isMobile: false, error: 'unknown' });
      expect(attached.has(TAB_ID)).toBe(false);
    });

    it('clears the error on the next successful action', async () => {
      const { deps, store } = createFakeChrome({
        [KEY]: { isMobile: false, error: 'unknown' },
      });

      const state = await createEmulationController(deps).toggle(TAB_ID);

      expect(state).toEqual({ isMobile: true, error: null });
      expect(store.get(KEY)).toEqual({ isMobile: true, error: null });
    });

    it('stays in mobile mode when turning it off fails', async () => {
      const { deps, store } = createFakeChrome();
      const controller = createEmulationController(deps);
      await controller.toggle(TAB_ID);
      deps.debugger.sendCommand.mockRejectedValueOnce(new Error('Target crashed'));

      const state = await controller.toggle(TAB_ID);

      expect(state).toEqual({ isMobile: true, error: 'unknown' });
      expect(store.get(KEY)).toEqual({ isMobile: true, error: 'unknown' });
    });

    it('recovers when the debugger is still attached but the state was lost', async () => {
      const { deps, store, attached } = createFakeChrome();
      attached.add(TAB_ID);

      const state = await createEmulationController(deps).toggle(TAB_ID);

      expect(state).toEqual({ isMobile: true, error: null });
      expect(store.get(KEY)).toEqual({ isMobile: true, error: null });
    });

    it('leaves a debugger session it did not open alone when the override fails', async () => {
      const { deps } = createFakeChrome();
      deps.debugger.attach.mockRejectedValueOnce(new Error(ALREADY_ATTACHED));
      deps.debugger.sendCommand.mockRejectedValueOnce(new Error(NOT_ATTACHED));

      const state = await createEmulationController(deps).toggle(TAB_ID);

      expect(state).toEqual({ isMobile: false, error: 'unknown' });
      expect(deps.debugger.detach).not.toHaveBeenCalled();
    });

    it('recovers when the state says mobile but the debugger is already gone', async () => {
      const { deps, store } = createFakeChrome({
        [KEY]: { isMobile: true, error: null },
      });

      const state = await createEmulationController(deps).toggle(TAB_ID);

      expect(state).toEqual({ isMobile: false, error: null });
      expect(store.has(KEY)).toBe(false);
    });
  });

  describe('restricted pages', () => {
    it('reports a restricted URL without touching the debugger', async () => {
      const { deps, store } = createFakeChrome();
      deps.getTabUrl.mockResolvedValueOnce('chrome://extensions');

      const state = await createEmulationController(deps).toggle(TAB_ID);

      expect(state).toEqual({ isMobile: false, error: 'restricted' });
      expect(store.get(KEY)).toEqual({ isMobile: false, error: 'restricted' });
      expect(deps.debugger.attach).not.toHaveBeenCalled();
    });

    it('classifies the attach rejection when the URL is not exposed', async () => {
      const { deps } = createFakeChrome();
      deps.getTabUrl.mockResolvedValueOnce(undefined);
      deps.debugger.attach.mockRejectedValueOnce(
        new Error('Cannot access a chrome:// URL')
      );

      const state = await createEmulationController(deps).toggle(TAB_ID);

      expect(state).toEqual({ isMobile: false, error: 'restricted' });
    });

    it('still attempts the toggle when the URL lookup itself fails', async () => {
      const { deps } = createFakeChrome();
      deps.getTabUrl.mockRejectedValueOnce(new Error('No tab with id'));

      const state = await createEmulationController(deps).toggle(TAB_ID);

      expect(state).toEqual({ isMobile: true, error: null });
    });
  });

  describe('handleDetach', () => {
    it('resets a mobile tab when the debugger is detached externally', async () => {
      const { deps, store } = createFakeChrome();
      const controller = createEmulationController(deps);
      await controller.toggle(TAB_ID);

      await controller.handleDetach(TAB_ID);

      expect(store.has(KEY)).toBe(false);
    });

    it('keeps a recorded error', async () => {
      const { deps, store } = createFakeChrome({
        [KEY]: { isMobile: true, error: 'unknown' },
      });

      await createEmulationController(deps).handleDetach(TAB_ID);

      expect(store.get(KEY)).toEqual({ isMobile: false, error: 'unknown' });
    });

    it('does nothing for a tab that is not in mobile mode', async () => {
      const { deps } = createFakeChrome();

      await createEmulationController(deps).handleDetach(TAB_ID);

      expect(deps.storage.set).not.toHaveBeenCalled();
      expect(deps.storage.remove).not.toHaveBeenCalled();
    });
  });

  describe('handleTabRemoved', () => {
    it('removes the state of the closed tab only', async () => {
      const { deps, store } = createFakeChrome({
        [KEY]: { isMobile: true, error: null },
        [tabStateKey(8)]: { isMobile: true, error: null },
      });

      await createEmulationController(deps).handleTabRemoved(TAB_ID);

      expect(store.has(KEY)).toBe(false);
      expect(store.has(tabStateKey(8))).toBe(true);
    });
  });
});
