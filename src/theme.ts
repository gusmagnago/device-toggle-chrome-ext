import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#9FE870',
    },
    secondary: {
      main: '#163300',
      contrastText: '#fe2c96',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h4: {
      fontSize: '1.2rem',
      fontWeight: 800,
    },
    body1: {
      fontSize: '0.8rem',
    },
    caption: {
      fontSize: '0.55em',
      fontWeight: 200,
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
        thumb: ({ ownerState: { checked }, theme: { palette } }) => ({
          width: '30px',
          height: '30px',
          color: checked ? palette.primary.main : palette.secondary.main,
        }),
        track: ({ ownerState: { checked }, theme: { palette } }) => ({
          borderRadius: '20px',
          backgroundColor: checked
            ? `${palette.secondary.main} !important`
            : palette.primary.main,
          position: 'relative',
          '&::after': {
            content: checked ? '"Mobile"' : '"Desktop"',
            position: 'absolute',
            left: checked ? '48%' : '55%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            color: checked ? palette.primary.main : palette.secondary.main,
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
          },
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme: { palette } }) => ({
          underline: 'hover',
          color: palette.secondary.contrastText,
          fontWeight: 800,
        }),
      },
    },
  },
});

export default theme;
