import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import React from 'react';
import { CssBaseline, useMediaQuery } from '@material-ui/core';
import AppRouter from './AppRouter';
import CapabilitiesProvider from './CapabilitiesProvider';
import { SnackbarProvider } from 'notistack';

const App = (): JSX.Element => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
        map: {
          free: '#0076FF',
          occupied: '#242424',
          segment1: '#19A1A1',
          segment2: '#7AC037',
          segment3: '#DF5618',
          segment4: '#F7C841',
          segmentFallback: '#9966CC',
          path: '#FAFAFAAA',
          noGo: { stroke: '#FF0000', fill: '#75000066' },
          noMop: { stroke: '#CC00FF', fill: '#58006E66' },
          active: { stroke: '#35911A', fill: '#6AF5424C' },
        },
      }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <SnackbarProvider maxSnack={3} autoHideDuration={5000}>
        <CapabilitiesProvider>
          <AppRouter />
        </CapabilitiesProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
