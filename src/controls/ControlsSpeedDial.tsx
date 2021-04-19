import { Backdrop, makeStyles } from '@material-ui/core';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import React from 'react';
import { Capability, useRobotState } from '../api';
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
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const ControlsSpeedDial = (): JSX.Element | null => {
  const classes = useSpeedDialStyles();
  const [isBasicControlSupported] = useCapabilitiesSupported(
    Capability.BasicControl
  );
  const { data: status } = useRobotState((state) => state.status);

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

    if (isBasicControlSupported) {
      if (status === 'idle' || status === 'docked') {
        actions.push({
          name: 'Start',
          icon: <StartIcon />,
          onClick() {
            handleClose();
          },
        });
      }

      if (
        status === 'cleaning' ||
        status === 'returning' ||
        status === 'moving'
      ) {
        actions.push(
          {
            name: 'Pause',
            icon: <PauseIcon />,
            onClick() {
              handleClose();
            },
          },
          {
            name: 'Stop',
            icon: <StopIcon />,
            onClick() {
              handleClose();
            },
          }
        );
      }

      if (status !== 'docked' && status !== 'returning') {
        actions.push({
          name: 'Home',
          icon: <HomeIcon />,
          onClick() {
            handleClose();
          },
        });
      }
    }

    return actions;
  }, [handleClose, isBasicControlSupported, status]);

  if (actions.length === 0) {
    return null;
  }

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

export default ControlsSpeedDial;
