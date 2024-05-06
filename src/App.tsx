import { useState } from 'react';
import './App.css';

function App() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const emulateDevice = async () => {
    try {
      const queryOptions = { active: true, currentWindow: true };
      const [tab] = await chrome.tabs.query(queryOptions);

      if (tab && typeof tab.id === 'number') {
        if (!isMobile) {
          await chrome.debugger.attach({ tabId: tab.id }, '1.3');
          await chrome.debugger.sendCommand(
            { tabId: tab.id },
            'Emulation.setDeviceMetricsOverride',
            {
              width: 375,
              height: 812,
              deviceScaleFactor: 3,
              mobile: true,
              fitWindow: true,
            }
          );
          setIsMobile(true);
        } else {
          await chrome.debugger.sendCommand(
            { tabId: tab.id },
            'Emulation.clearDeviceMetricsOverride',
            {}
          );
          setIsMobile(false);
          await chrome.debugger.detach({ tabId: tab.id });
        }
      } else {
        throw new Error('Could not proceed, try again later');
      }
    } catch (error) {
      setHasError(true);
      console.error('Erro emulateDevice:', error);
    }
  };

  return (
    <>
      <div>
        <h2>Toggle Device</h2>
      </div>
      <div>
        <button onClick={emulateDevice}>Click meeee</button>
        {hasError ? <p>Something went wrong, please try again later</p> : null}
      </div>
    </>
  );
}

export default App;
