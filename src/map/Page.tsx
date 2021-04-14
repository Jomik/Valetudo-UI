import {
  Box,
  Button,
  CircularProgress,
  Container,
  makeStyles,
  Typography,
  Backdrop,
} from '@material-ui/core';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import React from 'react';
import { Capability, useBasicControl, useLatestMap } from '../api';
import { useCapabilitySupported } from '../CapabilitiesProvider';
import Map from './Map';
import { PlayArrow as StartIcon } from '@material-ui/icons';

const useMapStyles = makeStyles(() => ({
  container: {
    flex: '1',
    height: '100%',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const useSpeedDialStyles = makeStyles((theme) => ({
  speedDial: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: theme.zIndex.drawer + 2,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const MapContainer = () => {
  const [{ data, loading, error }, refetch] = useLatestMap();
  const classes = useMapStyles();

  if (error) {
    return (
      <Container className={classes.container}>
        <Typography color="error">Error loading map data</Typography>
        <Box m={1} />
        <Button color="primary" variant="contained" onClick={() => refetch()}>
          Retry
        </Button>
      </Container>
    );
  }

  if (!data && loading) {
    return (
      <Container className={classes.container}>
        <CircularProgress />
      </Container>
    );
  }

  if (!data) {
    return (
      <Container className={classes.container}>
        <Typography align="center">No map data</Typography>;
      </Container>
    );
  }

  return <Map mapData={data} />;
};

const MapSpeedDial = (): JSX.Element => {
  const classes = useSpeedDialStyles();
  const isBasicControlSupported = useCapabilitySupported(
    Capability.BasicControl
  );
  const [{ loading, error }, basicControl] = useBasicControl();
  const [open, setOpen] = React.useState(false);

  const handleOpen = React.useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setOpen(false);
  }, []);

  const actions = React.useMemo<
    { name: string; icon: JSX.Element; onClick(): void }[]
  >(() => {
    const basicControls = isBasicControlSupported
      ? [
          {
            name: 'Start',
            icon: <StartIcon />,
            onClick() {
              basicControl('start');
              handleClose();
            },
          },
          {
            name: 'Pause',
            icon: <StartIcon />,
            onClick() {
              basicControl('pause');
              handleClose();
            },
          },
          {
            name: 'Stop',
            icon: <StartIcon />,
            onClick() {
              basicControl('stop');
              handleClose();
            },
          },
          {
            name: 'Home',
            icon: <StartIcon />,
            onClick() {
              basicControl('home');
              handleClose();
            },
          },
        ]
      : [];
    return [...basicControls];
  }, [basicControl, handleClose, isBasicControlSupported]);

  return (
    <>
      <Backdrop open={open} className={classes.backdrop} />
      <SpeedDial
        ariaLabel="SpeedDial map control"
        className={classes.speedDial}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>
    </>
  );
};

const Page = (): JSX.Element => {
  return (
    <>
      <MapContainer />
      <Box position="relative">
        <MapSpeedDial />
      </Box>
    </>
  );
};

export default Page;
