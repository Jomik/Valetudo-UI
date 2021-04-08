import {
  Backdrop,
  Button,
  CircularProgress,
  createStyles,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { SnackbarKey, useSnackbar } from 'notistack';
import React from 'react';
import { useCapabilitiesRequest } from './api/hooks';
import { Capability } from './api';

const useStyles = makeStyles((theme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
      display: 'flex',
      flexFlow: 'column',
    },
  })
);

const Context = React.createContext<Capability[]>([]);

const CapabilitiesProvider = (props: {
  children: JSX.Element;
}): JSX.Element => {
  const { children } = props;
  const classes = useStyles();
  const [{ data, loading, error }, refetch] = useCapabilitiesRequest();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  React.useEffect(() => {
    if (!error) {
      return;
    }

    const SnackbarAction = (key: SnackbarKey) => (
      <Button
        onClick={() => {
          refetch().then(() =>
            enqueueSnackbar('Succesfully loaded capabilities!', {
              variant: 'success',
            })
          );
          closeSnackbar(key);
        }}
      >
        Retry
      </Button>
    );

    enqueueSnackbar('Error while loading capabilities', {
      variant: 'error',
      action: SnackbarAction,
      persist: true,
    });
    console.error(error);
  }, [closeSnackbar, enqueueSnackbar, error, refetch]);

  return (
    <Context.Provider value={data ?? []}>
      <Backdrop
        open={loading}
        className={classes.backdrop}
        style={{ transitionDelay: loading ? '800ms' : '0ms' }}
      >
        <CircularProgress />
        <Typography variant="caption">Loading capabilities...</Typography>
      </Backdrop>
      {children}
    </Context.Provider>
  );
};

export default CapabilitiesProvider;
