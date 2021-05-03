import { Box, Button, ButtonGroup, makeStyles, Paper } from '@material-ui/core';
import React from 'react';
import { useRobotStatus, useBasicControlMutation } from '../api';
import {
  Home as HomeIcon,
  Pause as PauseIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(1),
    marginLeft: -theme.spacing(1),
  },
}));

const BasicControls = (): JSX.Element => {
  const classes = useStyles();
  const { data: status } = useRobotStatus();
  const { mutate: sendCommand, isLoading } = useBasicControlMutation();

  const actions = React.useMemo<
    { name: string; icon: JSX.Element; onClick(): void }[]
  >(() => {
    if (status === undefined) {
      return [];
    }
    const actions: { name: string; icon: JSX.Element; onClick(): void }[] = [];
    const { value: state, flag } = status;

    if (state === 'error') {
      return [];
    }

    if (flag === 'resumable') {
      actions.push(
        {
          name: 'Resume',
          icon: <StartIcon />,
          onClick() {
            sendCommand('start');
          },
        },
        {
          name: 'Stop',
          icon: <StopIcon />,
          onClick() {
            sendCommand('stop');
          },
        }
      );
    } else if (state === 'idle' || state === 'docked') {
      actions.push({
        name: 'Start',
        icon: <StartIcon />,
        onClick() {
          sendCommand('start');
        },
      });
    } else {
      actions.push({
        name: 'Stop',
        icon: <StopIcon />,
        onClick() {
          sendCommand('stop');
        },
      });
    }

    if (state === 'cleaning' || state === 'returning') {
      actions.push({
        name: 'Pause',
        icon: <PauseIcon />,
        onClick() {
          sendCommand('pause');
        },
      });
    }

    if (state === 'idle') {
      actions.push({
        name: 'Home',
        icon: <HomeIcon />,
        onClick() {
          sendCommand('home');
        },
      });
    }

    return actions;
  }, [sendCommand, status]);

  return (
    <Paper>
      <Box p={1}>
        <ButtonGroup size="medium" disabled={isLoading}>
          {actions.map(({ name, icon, onClick }) => (
            <Button key={name} onClick={onClick}>
              {React.cloneElement(icon, { className: classes.icon })} {name}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    </Paper>
  );
};

export default BasicControls;
