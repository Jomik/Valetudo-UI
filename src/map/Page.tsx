import { Button, CircularProgress, Typography } from '@material-ui/core';
import { SnackbarKey, useSnackbar } from 'notistack';
import React from 'react';
import { useLatestMap } from '../api';
import Map from './Map';

const Page = (): JSX.Element => {
  const [{ data, loading, error }, refetch] = useLatestMap();

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  React.useEffect(() => {
    if (!error) {
      return;
    }

    const SnackbarAction = (key: SnackbarKey) => (
      <Button
        onClick={() => {
          refetch();
          closeSnackbar(key);
        }}
      >
        Retry
      </Button>
    );

    enqueueSnackbar('Error while loading map', {
      variant: 'error',
      action: SnackbarAction,
      persist: true,
    });
    console.error(error);
  }, [closeSnackbar, enqueueSnackbar, error, refetch]);

  if (!data && loading) {
    return <CircularProgress />;
  }

  if (!data) {
    return <Typography>No map data</Typography>;
  }

  return <Map mapData={data} />;
};

export default Page;
