import {
  Box,
  CircularProgress,
  Fab,
  FabProps,
  Grid,
  makeStyles,
  styled,
  Typography,
} from '@material-ui/core';
import {
  Home as HomeIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
} from '@material-ui/icons';
import { BottomSheet } from 'react-spring-bottom-sheet';
import ControlsPage from './ControlsPage';
import 'react-spring-bottom-sheet/dist/style.css';
import { Capability, useBasicControlMutation, useRobotState } from '../api';
import { useCapabilitiesSupported } from '../CapabilitiesProvider';

const StyledBottomSheet = styled(BottomSheet)(({ theme }) => ({
  '--rsbs-bg': theme.palette.background.paper,
  '--rsbs-handle-bg': 'hsla(0, 0%, 0%, 0.14)',
  '--rsbs-max-w': 'auto',
  '--rsbs-ml': 'env(safe-area-inset-left)',
  '--rsbs-mr': 'env(safe-area-inset-right)',
  '--rsbs-overlay-rounded': '8px',
}));

const SheetBackground = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'absolute',
  top: -17,
  right: theme.spacing(5),
}));

const useStyles = makeStyles((theme) => ({
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
}));

const fabProps: Partial<FabProps> = {
  color: 'primary',
  size: 'medium',
  variant: 'extended',
};
const ActionButton = (): JSX.Element | null => {
  const classes = useStyles();
  const { data: state } = useRobotState((state) => state.status.state);
  const { mutate: sendCommand, isLoading } = useBasicControlMutation();

  if (state === undefined) {
    return null;
  }

  if (isLoading) {
    return (
      <StyledFab {...fabProps} variant="round">
        <CircularProgress color="inherit" size={30} />
      </StyledFab>
    );
  }

  if (state === 'docked') {
    return (
      <StyledFab
        {...fabProps}
        onClick={() => {
          sendCommand('start');
        }}
      >
        <StartIcon className={classes.extendedIcon} />
        Start
      </StyledFab>
    );
  }

  if (state === 'cleaning' || state === 'moving' || state === 'returning') {
    return (
      <StyledFab
        {...fabProps}
        onClick={() => {
          sendCommand('stop');
        }}
      >
        <StopIcon className={classes.extendedIcon} />
        Stop
      </StyledFab>
    );
  }

  return (
    <StyledFab
      {...fabProps}
      onClick={() => {
        sendCommand('home');
      }}
    >
      <HomeIcon className={classes.extendedIcon} />
      Home
    </StyledFab>
  );
};

const ControlsBottomSheet = (): JSX.Element => {
  const [basicControl] = useCapabilitiesSupported(Capability.BasicControl);

  return (
    <StyledBottomSheet
      open
      blocking={false}
      snapPoints={({ maxHeight, headerHeight }) => [
        headerHeight,
        maxHeight * 0.3,
        maxHeight * 0.5,
        maxHeight * 0.8,
      ]}
      header={
        <>
          {basicControl && <ActionButton />}
          <Grid container>
            <Grid item>
              <Typography variant="subtitle1">Controls</Typography>
            </Grid>
          </Grid>
        </>
      }
    >
      <SheetBackground px={1} py={1}>
        <ControlsPage />
      </SheetBackground>
    </StyledBottomSheet>
  );
};

export default ControlsBottomSheet;
