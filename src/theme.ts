import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Inter, sans-serif',
    h4: {
        fontSize: '1.2rem',
        fontWeight: 800
    },
    body1: {
      fontSize: '0.8rem',
    },
    caption: {
      color: '#fe2c96',
      fontSize: '0.55em',
      fontWeight: 600,
    },
    overline: {
      fontSize: '0.55em',
      fontWeight: 600,
    },
  },
  components: {
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: '150px',
          height: '65px',
        },
        switchBase: {
          top: '8px',
          left: '6%',
          '&.Mui-checked': {
            transform: 'translateX(85px)',
          },
        },
        thumb: ({ ownerState: { checked } }) => ({
          width: '30px',
          height: '30px',
          color: checked ? '#9FE870 !important' : '#163300',
        }),
        track: ({ ownerState: { checked } }) => ({
          borderRadius: '20px',
          backgroundColor: checked ? '#163300 !important' : '#9FE870',
          position: 'relative',
          '&::after': {
            content: checked ? '"Mobile"' : '"Desktop"',
            position: 'absolute',
            left: checked ? '50%' : '55%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            color: checked ? '#9FE870' : '#163300',
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
          },
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          underline: 'hover',
          color: '#fe2c96',
          fontWeight: 800,
        },
      },
    },
  },
});

export default theme;
