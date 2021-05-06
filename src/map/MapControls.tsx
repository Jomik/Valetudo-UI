import {
  Backdrop,
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
    <Grid container alignItems="center" spacing={1}>
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
    <Grid container alignItems="center" spacing={1}>
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
    position: 'absolute',
    top: theme.spacing(10),
    left: theme.spacing(2),
    zIndex: theme.zIndex.drawer + 2,
    pointerEvents: 'none',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
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

const MapControls = (): JSX.Element | null => {
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
      <Grid container spacing={1} className={classes.root}>
        <Grid item>
          <StyledSpeedDial
            color="inherit"
            open={open}
            icon={layerToIcon[selectedLayer]}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            ariaLabel="MapLayer SpeedDial"
            direction="down"
            FabProps={{ size: 'small' }}
          >
            {layers.map((layer) => (
              <SpeedDialAction
                key={layer}
                tooltipOpen
                tooltipTitle={layerToLabel[layer]}
                tooltipPlacement="right"
                icon={layerToIcon[layer]}
                onClick={selectLayer(layer)}
              />
            ))}
          </StyledSpeedDial>
        </Grid>
        <Grid item>{layerToActions[selectedLayer]}</Grid>
      </Grid>
    </>
  );
};

export default MapControls;
