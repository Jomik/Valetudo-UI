import {
  Backdrop,
  Box,
  CircularProgress,
  Fab,
  Grid,
  makeStyles,
  styled,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { SpeedDial, SpeedDialAction } from '@material-ui/lab';
import {
  LayersOutlined as SegmentsIcon,
  PinDrop as GoIcon,
  BorderStyle as ZonesIcon,
} from '@material-ui/icons';
import { MapContext, useMapContext } from './MapContextProvider';
import {
  useCleanSegmentsMutation,
  useGoToMutation,
  useRobotStatus,
} from '../api';

const StyledSpeedDial = styled(SpeedDial)({
  '& .MuiSpeedDial-fab': {
    backgroundColor: 'rgba(0,0,0,0.5)',
    border: '1px solid',
  },
});

const StyledFab = styled(Fab)({
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

const GoLayer = (): JSX.Element => {
  const { goToPoint, onClear } = useMapContext();
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

const SegmentsLayer = (): JSX.Element => {
  const { selectedSegments, onClear } = useMapContext();
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

const useControlsStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  container: {
    position: 'absolute',
    pointerEvents: 'none',
    top: theme.spacing(2),
    left: theme.spacing(2),
    right: theme.spacing(2),
  },
  speedDial: {
    zIndex: theme.zIndex.speedDial,
  },
  backdrop: {
    zIndex: theme.zIndex.speedDial - 1,
  },
  layer: {
    zIndex: theme.zIndex.speedDial - 2,
  },
}));

const layerToIcon: Record<MapContext['layers'][number], JSX.Element> = {
  go: <GoIcon />,
  segments: <SegmentsIcon />,
  zones: <ZonesIcon />,
};

const layerToLabel: Record<MapContext['layers'][number], string> = {
  go: 'Go',
  segments: 'Segments',
  zones: 'Zones',
};

const layerToActions: Record<MapContext['layers'][number], JSX.Element> = {
  go: <GoLayer />,
  segments: <SegmentsLayer />,
  zones: <></>,
};

const MapControls = (props: { children: JSX.Element }): JSX.Element | null => {
  const { children } = props;
  const classes = useControlsStyles();
  const [open, setOpen] = React.useState(false);
  const { layers, selectedLayer, onSelectLayer } = useMapContext();

  if (selectedLayer === undefined) {
    return null;
  }

  const selectLayer = (...args: Parameters<typeof onSelectLayer>) => () => {
    setOpen(false);
    onSelectLayer(...args);
  };

  return (
    <>
      <Backdrop open={open} className={classes.backdrop} />
      <Box className={classes.root}>
        {children}
        <Box className={classes.container}>
          <Grid container spacing={1} direction="row-reverse">
            <Grid item className={classes.speedDial}>
              <StyledSpeedDial
                direction="down"
                color="inherit"
                open={open}
                icon={layerToIcon[selectedLayer]}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                ariaLabel="MapLayer SpeedDial"
                FabProps={{ size: 'small' }}
              >
                {layers.map((layer) => (
                  <SpeedDialAction
                    key={layer}
                    tooltipOpen
                    tooltipTitle={layerToLabel[layer]}
                    icon={layerToIcon[layer]}
                    onClick={selectLayer(layer)}
                  />
                ))}
              </StyledSpeedDial>
            </Grid>
            <Grid item xs className={classes.layer}>
              {layerToActions[selectedLayer]}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default MapControls;
