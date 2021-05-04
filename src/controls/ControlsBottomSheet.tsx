import { Box, Grid, styled, Typography } from '@material-ui/core';
import { BottomSheet } from 'react-spring-bottom-sheet';
import ControlsBody from './ControlsBody';
import 'react-spring-bottom-sheet/dist/style.css';

const StyledBottomSheet = styled(BottomSheet)(({ theme }) => ({
  '--rsbs-bg': theme.palette.background.paper,
  '--rsbs-handle-bg': 'hsla(0, 0%, 0%, 0.14)',
  '--rsbs-max-w': 'auto',
  '--rsbs-ml': 'env(safe-area-inset-left)',
  '--rsbs-mr': 'env(safe-area-inset-right)',
  '--rsbs-overlay-rounded': '8px',
}));

const Sheet = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
}));

const ControlsBottomSheet = (): JSX.Element => {
  return (
    <StyledBottomSheet
      open
      blocking={false}
      snapPoints={({ maxHeight, headerHeight }) => [
        headerHeight,
        maxHeight * 0.2,
        maxHeight * 0.5,
        maxHeight * 0.8,
      ]}
      header={
        <>
          <Grid container>
            <Grid item>
              <Typography variant="subtitle1">Controls</Typography>
            </Grid>
          </Grid>
        </>
      }
    >
      <Sheet p={1}>
        <ControlsBody />
      </Sheet>
    </StyledBottomSheet>
  );
};

export default ControlsBottomSheet;
