import { CircularProgress, Grid, Typography } from '@material-ui/core';
import React from 'react';
import { useRobotMapLayerContext } from './RobotControlMapProvider';
import { useCleanSegmentsMutation, useRobotStatus } from '../../api';
import { StyledFab } from './Styled';

const SegmentsLayer = (): JSX.Element => {
  const { selectedSegments, onClear } = useRobotMapLayerContext();
  const { data: status } = useRobotStatus((state) => state.value);
  const { mutate, isLoading } = useCleanSegmentsMutation({
    onSuccess: onClear,
  });

  const canClean = status === 'idle' || status === 'docked';
  const didSelectSegments = selectedSegments.length > 0;

  const handleClick = React.useCallback(() => {
    if (!didSelectSegments || !canClean) {
      return;
    }

    mutate(selectedSegments);
  }, [canClean, didSelectSegments, mutate, selectedSegments]);

  return (
    <Grid container spacing={1} direction="column" alignItems="flex-end">
      <Grid item>
        <StyledFab
          disabled={!didSelectSegments || isLoading || !canClean}
          color="inherit"
          size="medium"
          variant="extended"
          onClick={handleClick}
        >
          Clean {selectedSegments.length} segments
          {isLoading && (
            <CircularProgress
              color="inherit"
              size={18}
              style={{ marginLeft: 10 }}
            />
          )}
        </StyledFab>
      </Grid>
      {didSelectSegments && !canClean && (
        <Grid item>
          <Typography variant="caption" color="textSecondary">
            Can only start segments cleaning when idle
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default SegmentsLayer;
