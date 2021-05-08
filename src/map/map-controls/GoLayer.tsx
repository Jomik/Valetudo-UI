import { CircularProgress, Grid, Typography } from '@material-ui/core';
import React from 'react';
import { useRobotMapLayerContext } from './RobotControlMapProvider';
import { useGoToMutation, useRobotStatus } from '../../api';
import { StyledFab } from './Styled';

const GoLayer = (): JSX.Element => {
  const { goToPoint, onClear } = useRobotMapLayerContext();
  const { data: status } = useRobotStatus((state) => state.value);
  const { mutate, isLoading } = useGoToMutation({
    onSuccess: onClear,
  });

  const canGo = status === 'idle' || status === 'docked';

  const handleClick = React.useCallback(() => {
    if (goToPoint === undefined || !canGo) {
      return;
    }

    mutate(goToPoint);
  }, [canGo, goToPoint, mutate]);

  return (
    <Grid container alignItems="center" spacing={1} direction="row-reverse">
      <Grid item>
        <StyledFab
          disabled={goToPoint === undefined || isLoading || !canGo}
          color="inherit"
          size="medium"
          variant="extended"
          onClick={handleClick}
        >
          Go
          {isLoading && (
            <CircularProgress
              color="inherit"
              size={18}
              style={{ marginLeft: 10 }}
            />
          )}
        </StyledFab>
      </Grid>
      {goToPoint !== undefined && !canGo && (
        <Grid item>
          <Typography variant="caption" color="textSecondary">
            Can only go to point when idle
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default GoLayer;
