import React from 'react';
import Box from '@material-ui/core/Box';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import { Paper, useTheme } from '@material-ui/core';

export interface BottomSheetProps {
  children: JSX.Element;
  bleed?: number;
  height?: string;
}

const BottomSheet = (props: BottomSheetProps): JSX.Element => {
  const { children, bleed = 128, height = '80%' } = props;
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={toggleDrawer(false)}
      onOpen={toggleDrawer(true)}
      swipeAreaWidth={bleed}
      disableSwipeToOpen={false}
      keepMounted
      PaperProps={{
        style: {
          height: `calc(${height} - ${bleed}px)`,
          overflow: 'visible',
        },
      }}
      SwipeAreaProps={{
        onClick: toggleDrawer(true),
      }}
    >
      <Paper
        style={{
          position: 'absolute',
          top: -bleed,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          visibility: 'visible',
          height: `calc(100% + ${bleed}px)`,
          right: 0,
          left: 0,
          paddingTop: theme.spacing(3),
        }}
      >
        <Box
          style={{
            width: 30,
            height: 4,
            backgroundColor: theme.palette.grey[300],
            borderRadius: '3px',
            position: 'absolute',
            top: 8,
            left: 'calc(50% - 15px)',
          }}
        />
        {children}
      </Paper>
    </SwipeableDrawer>
  );
};

export default BottomSheet;
