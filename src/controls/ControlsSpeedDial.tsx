import { Backdrop, CircularProgress, Fab, makeStyles } from '@material-ui/core';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import React from 'react';
import { Capability, useBasicControlMutation, useRobotState } from '../api';
import { useCapabilitiesSupported } from '../CapabilitiesProvider';
import {
  Home as HomeIcon,
  Pause as PauseIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
} from '@material-ui/icons';

const useSpeedDialStyles = makeStyles((theme) => ({
  speedDial: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: theme.zIndex.drawer + 2,
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
  loadingBackdrop: {
    zIndex: theme.zIndex.drawer + 3,
  },
}));

const ControlsSpeedDial = (): JSX.Element | null => {
  const classes = useSpeedDialStyles();
  const [isBasicControlSupported] = useCapabilitiesSupported(
    Capability.BasicControl
  );
  const { data: status } = useRobotState((state) => state.status);
  const { mutate: sendCommand, isLoading } = useBasicControlMutation();

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
    if (status === undefined) {
      return [];
    }
    const actions: { name: string; icon: JSX.Element; onClick(): void }[] = [];
    const { state, flag } = status;

    if (state === 'error') {
      return [];
    }

    if (isBasicControlSupported) {
      if (flag === 'resumable') {
        actions.push(
          {
            name: 'Resume',
            icon: <StartIcon />,
            onClick() {
              sendCommand('start');
              handleClose();
            },
          },
          {
            name: 'Stop',
            icon: <StopIcon />,
            onClick() {
              sendCommand('stop');
              handleClose();
            },
          }
        );
      } else if (state === 'idle' || state === 'docked') {
        actions.push({
          name: 'Start',
          icon: <StartIcon />,
          onClick() {
            sendCommand('start');
            handleClose();
          },
        });
      } else {
        actions.push({
          name: 'Stop',
          icon: <StopIcon />,
          onClick() {
            sendCommand('stop');
            handleClose();
          },
        });
      }

      if (state === 'cleaning' || state === 'returning') {
        actions.push({
          name: 'Pause',
          icon: <PauseIcon />,
          onClick() {
            sendCommand('pause');
            handleClose();
          },
        });
      }

      if (state === 'idle') {
        actions.push({
          name: 'Home',
          icon: <HomeIcon />,
          onClick() {
            sendCommand('home');
            handleClose();
          },
        });
      }
    }

    return actions;
  }, [handleClose, isBasicControlSupported, sendCommand, status]);

  if (actions.length === 0) {
    return null;
  }

  if (actions.length === 1) {
    const [{ icon, name, onClick }] = actions;
    return (
      <Fab
        disabled={isLoading}
        variant="extended"
        className={classes.speedDial}
        onClick={onClick}
        color="primary"
      >
        {isLoading ? (
          <CircularProgress color="inherit" />
        ) : (
          React.cloneElement(icon, { className: classes.extendedIcon })
        )}
        {name}
      </Fab>
    );
  }

  return (
    <>
      <Backdrop open={!isLoading && open} className={classes.backdrop} />
      <SpeedDial
        ariaLabel="SpeedDial for basic controls"
        className={classes.speedDial}
        icon={
          isLoading ? <CircularProgress color="inherit" /> : <SpeedDialIcon />
        }
        onClose={handleClose}
        onOpen={handleOpen}
        open={!isLoading && open}
      >
        {actions.map(({ name, icon, onClick }) => (
          <SpeedDialAction
            key={name}
            icon={icon}
            tooltipTitle={name}
            tooltipOpen
            onClick={onClick}
          />
        ))}
      </SpeedDial>
    </>
  );
};

export default ControlsSpeedDial;
