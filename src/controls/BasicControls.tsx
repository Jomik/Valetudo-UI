import {
  Box,
  Button,
  ButtonGroup,
  makeStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useRobotStatus, useBasicControlMutation, StatusState } from '../api';
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

const StartStates: StatusState['value'][] = ['idle', 'docked', 'paused'];
const PauseStates: StatusState['value'][] = ['cleaning', 'returning', 'moving'];

const BasicControls = (): JSX.Element => {
  const classes = useStyles();
  const { data: status } = useRobotStatus();
  const { mutate, isLoading } = useBasicControlMutation();
  const sendCommand = (...args: Parameters<typeof mutate>) => () =>
    mutate(...args);

  if (status === undefined) {
    return (
      <Paper>
        <Box p={1}>
          <Typography color="error">Error loading basic controls</Typography>
        </Box>
      </Paper>
    );
  }

  const { flag, value: state } = status;

  return (
    <Paper>
      <Box p={1}>
        <ButtonGroup size="medium" disabled={isLoading}>
          <Button
            disabled={!StartStates.includes(state)}
            onClick={sendCommand('start')}
          >
            <StartIcon className={classes.icon} />{' '}
            {flag === 'resumable' ? 'Resume' : 'Start'}
          </Button>
          <Button
            disabled={!PauseStates.includes(state)}
            onClick={sendCommand('pause')}
          >
            <PauseIcon className={classes.icon} /> Pause
          </Button>
          <Button
            disabled={
              !(flag === 'resumable') &&
              (state === 'idle' || state === 'docked')
            }
            onClick={sendCommand('stop')}
          >
            <StopIcon className={classes.icon} /> Stop
          </Button>
          <Button disabled={state !== 'idle'} onClick={sendCommand('home')}>
            <HomeIcon className={classes.icon} /> Home
          </Button>
        </ButtonGroup>
      </Box>
    </Paper>
  );
};

export default BasicControls;
