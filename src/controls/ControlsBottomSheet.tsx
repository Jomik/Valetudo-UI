import {
  Box,
  Divider,
  Fab,
  styled,
  SwipeableDrawer,
  Typography,
  useTheme,
  withStyles,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { PlayArrow as StartIcon } from '@material-ui/icons';
import React from 'react';
import ControlsPage from './ControlsPage';

const drawerBleeding = 56;

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.type === 'light' ? '#fff' : grey[800],
}));

const Puller = styled(Box)(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: theme.palette.type === 'light' ? grey[300] : grey[900],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
}));

const BleedingDrawer = withStyles((theme) => ({
  paper: {
    height: `calc(80% - ${drawerBleeding}px)`,
    overflow: 'visible',
    backgroundColor: theme.palette.background.default,
  },
}))(SwipeableDrawer);

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'absolute',
  top: -17,
  right: theme.spacing(2),
}));

const ControlsBottomSheet = (): JSX.Element => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <BleedingDrawer
      anchor="bottom"
      open={open}
      onClose={toggleDrawer(false)}
      onOpen={toggleDrawer(true)}
      swipeAreaWidth={drawerBleeding}
      disableSwipeToOpen={false}
      keepMounted
    >
      <StyledBox
        style={{
          position: 'absolute',
          top: -drawerBleeding,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          visibility: 'visible',
          right: 0,
          left: 0,
        }}
      >
        <StyledFab
          color="primary"
          size="small"
          onClick={() => {
            console.log('foo');
          }}
        >
          <StartIcon />
        </StyledFab>
        <Puller />
        <Typography style={{ padding: theme.spacing(2) }}>Controls</Typography>
        <Divider />
      </StyledBox>
      <Box
        mt={1}
        px={2}
        pb={2}
        style={{
          height: '100%',
          overflow: 'auto',
        }}
      >
        <ControlsPage />
      </Box>
    </BleedingDrawer>
  );
};

export default ControlsBottomSheet;
