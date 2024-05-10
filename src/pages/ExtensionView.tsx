import { useState } from 'react';
import { Box, Link, Switch, Typography } from '@mui/material';


// Page not in use
function ExtensionView() {
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
    <Box width={160} height='auto' p={2}>
      <div>
        <Typography variant='h4'>Toggle Device</Typography>
      </div>
      <Box display='flex' flexDirection='column' alignItems='center'>
        <Switch
          checked={isMobile}
          name='toggleDevice'
          onChange={emulateDevice}
        />
        {hasError ? (
          <Typography variant='caption' color='#fe2c96'>
            Something went wrong, please try again later
          </Typography>
        ) : null}
        <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
          <Typography variant='body1' textAlign='left'>
            Switch between Desktop and Mobile view
          </Typography>
          <Box display='flex' flexDirection='column' alignItems='center'>
            <Typography variant='caption' align='left' fontSize={10}>
              Please read our
              <Link href='/privacy-policy' target='_blank' px={1}>
                Privacy Policy
              </Link>
              to learn why we access your tab ID.
            </Typography>
            <Typography variant='overline'>
              Find me
              <Link
                href='https://github.com/gusmagnago'
                target='_blank'
                px={0.5}
              >
                here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}


export default ExtensionView;
