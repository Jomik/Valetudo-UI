import { Fab, styled } from '@material-ui/core';
import { SpeedDial } from '@material-ui/lab';

export const StyledSpeedDial = styled(SpeedDial)({
  '& .MuiSpeedDial-fab': {
    backgroundColor: 'rgba(0,0,0,0.5)',
    border: '1px solid',
  },
});
export const StyledFab = styled(Fab)({
  pointerEvents: 'auto',
  backgroundColor: 'rgba(0,0,0,0.5)',
  border: '1px solid #fff',
  '&:hover,&:focus': {
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  '& 	.MuiFab-label': {
    color: '#fff',
  },
});
