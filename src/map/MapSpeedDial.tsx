import { Backdrop, makeStyles } from '@material-ui/core';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import React from 'react';
import {
  Capability,
  useBasicControl,
  useRobotState,
  RobotAttributeClass,
  StatusState,
} from '../api';
import { useCapabilitySupported } from '../CapabilitiesProvider';
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

const MapSpeedDial = (): JSX.Element | null => {
  const classes = useSpeedDialStyles();
  const isBasicControlSupported = useCapabilitySupported(
    Capability.BasicControl
  );
  const [basicControlResponse, basicControl] = useBasicControl();
  const [{ data: state, loading, error }, refresh] = useRobotState();

  const status = React.useMemo(
    () =>
      state?.attributes.find(
        (x): x is StatusState => x.__class === RobotAttributeClass.StatusState
      ),
    [state?.attributes]
  );

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
    const actions: { name: string; icon: JSX.Element; onClick(): void }[] = [];

    if (isBasicControlSupported && status !== undefined) {
      if (status.flag === 'resumable') {
        actions.push({
          name: 'Resume',
          icon: <StartIcon />,
          onClick() {
            basicControl('start').finally(refresh);
            handleClose();
          },
        });
      } else if (status.value === 'idle' || status.value === 'docked') {
        actions.push({
          name: 'Start',
          icon: <StartIcon />,
          onClick() {
            basicControl('start').finally(refresh);
            handleClose();
          },
        });
      }

      if (
        status.value === 'cleaning' ||
        status.value === 'returning' ||
        status.value === 'moving'
      ) {
        actions.push(
          {
            name: 'Pause',
            icon: <PauseIcon />,
            onClick() {
              basicControl('pause').finally(refresh);
              handleClose();
            },
          },
          {
            name: 'Stop',
            icon: <StopIcon />,
            onClick() {
              basicControl('stop').finally(refresh);
              handleClose();
            },
          }
        );
      }

      if (status.value !== 'docked' && status.value !== 'returning') {
        actions.push({
          name: 'Home',
          icon: <HomeIcon />,
          onClick() {
            basicControl('home').finally(refresh);
            handleClose();
          },
        });
      }
    }

    return actions;
  }, [basicControl, handleClose, isBasicControlSupported, refresh, status]);

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

export default MapSpeedDial;
