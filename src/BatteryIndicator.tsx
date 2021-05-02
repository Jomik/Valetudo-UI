import {
  Box,
  CircularProgress,
  CircularProgressProps,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useRobotState } from './api';

export type BatteryIndicatorProps = Omit<
  CircularProgressProps,
  'value' | 'variant'
>;

const BatteryIndicator = (props: BatteryIndicatorProps): JSX.Element => {
  const { data: battery } = useRobotState((state) => state.battery);

  const label = React.useMemo(() => {
    if (battery === undefined) {
      return null;
    }
    const { level } = battery;

    return (
      <Typography
        variant="caption"
        component="div"
        color="inherit"
      >{`${Math.round(level)}%`}</Typography>
    );
  }, [battery]);

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        color="inherit"
        {...props}
        value={battery?.level}
        variant={
          battery?.status === 'charging' || battery?.status === 'charged'
            ? 'indeterminate'
            : 'determinate'
        }
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {label}
      </Box>
    </Box>
  );
};

export default BatteryIndicator;
