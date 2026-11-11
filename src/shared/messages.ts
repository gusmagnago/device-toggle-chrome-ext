export const TOGGLE_EMULATION = 'TOGGLE_EMULATION';

export interface ToggleEmulationMessage {
  type: typeof TOGGLE_EMULATION;
  tabId: number;
}

export const createToggleMessage = (tabId: number): ToggleEmulationMessage => ({
  type: TOGGLE_EMULATION,
  tabId,
});

export const isToggleMessage = (
  value: unknown
): value is ToggleEmulationMessage => {
  if (typeof value !== 'object' || value === null) return false;

  const message = value as Record<string, unknown>;
  return message.type === TOGGLE_EMULATION && typeof message.tabId === 'number';
};
