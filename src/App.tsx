import { Box, Link, Switch, Typography } from '@mui/material';
import { useTabEmulation } from './hooks/useTabEmulation';

const App = () => {
  const { state, toggle } = useTabEmulation();

  return (
    <Box width={160} height='auto' p={2}>
      <div>
        <Typography variant='h4'>Device Toggle</Typography>
      </div>
      <Box display='flex' flexDirection='column' alignItems='center'>
        <Switch
          checked={state.isMobile}
          name='toggleDevice'
          onChange={toggle}
        />
        {state.error ? (
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
              <Link
                href='https://github.com/gusmagnago/device-toggle-chrome-ext/blob/main/privacyPolicy.md'
                target='_blank'
                px={1}
              >
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
};

export default App;
