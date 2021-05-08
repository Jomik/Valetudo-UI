import { Backdrop, Box, Grid, makeStyles } from '@material-ui/core';
import React from 'react';
import { SpeedDialAction } from '@material-ui/lab';
import {
  LayersOutlined as SegmentsIcon,
  PinDrop as GoIcon,
  BorderStyle as ZonesIcon,
} from '@material-ui/icons';
import { StyledSpeedDial } from './Styled';
import GoLayer from './GoLayer';
import SegmentsLayer from './SegmentsLayer';
import {
  RobotMapLayerContext,
  useRobotMapLayerContext,
} from './RobotControlMapProvider';

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

const layerToIcon: Record<
  RobotMapLayerContext['layers'][number],
  JSX.Element
> = {
  go: <GoIcon />,
  segments: <SegmentsIcon />,
  zones: <ZonesIcon />,
};

const layerToLabel: Record<RobotMapLayerContext['layers'][number], string> = {
  go: 'Go',
  segments: 'Segments',
  zones: 'Zones',
};

const layerToActions: Record<
  RobotMapLayerContext['layers'][number],
  JSX.Element
> = {
  go: <GoLayer />,
  segments: <SegmentsLayer />,
  zones: <></>,
};

const RobotMapLayers = (props: {
  children: JSX.Element;
}): JSX.Element | null => {
  const { children } = props;
  const classes = useControlsStyles();
  const [open, setOpen] = React.useState(false);
  const { layers, selectedLayer, onSelectLayer } = useRobotMapLayerContext();

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

export default RobotMapLayers;
