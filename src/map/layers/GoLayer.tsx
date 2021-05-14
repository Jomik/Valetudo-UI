import {
  CircularProgress,
  Fade,
  Grid,
  Typography,
  Zoom,
} from '@material-ui/core';
import React from 'react';
import { Coordinates, useGoToMutation, useRobotStatus } from '../../api';
import Map from '../Map';
import { LayerActionsContainer, LayerActionButton } from './Styled';
import { Image } from 'react-konva';
import markerSrc from '../shapes/assets/marker.svg';
import { MapLayersProps } from './types';
import { manhatten, pairWiseArray } from '../utils';
import { useMapEntities, useMapLabels, useMapLayers } from './hooks';

const markerImage = new window.Image();
markerImage.src = markerSrc;

interface GoLayerOverlayProps {
  goToPoint: Coordinates | undefined;
  onClear(): void;
}

const GoLayerOverlay = (props: GoLayerOverlayProps): JSX.Element => {
  const { goToPoint, onClear } = props;
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
        <Zoom in>
          <LayerActionButton
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
          </LayerActionButton>
        </Zoom>
      </Grid>
      <Grid item>
        <Zoom in={goToPoint !== undefined && !isLoading} unmountOnExit>
          <LayerActionButton
            color="inherit"
            size="medium"
            variant="extended"
            onClick={onClear}
          >
            Clear
          </LayerActionButton>
        </Zoom>
      </Grid>
      <Grid item>
        <Fade in={goToPoint !== undefined && !canGo} unmountOnExit>
          <Typography variant="caption" color="textSecondary">
            Can only go to point when idle
          </Typography>
        </Fade>
      </Grid>
    </Grid>
  );
};

const GoLayer = (props: MapLayersProps): JSX.Element => {
  const { data, padding } = props;
  const [goToPoint, setGoToPoint] = React.useState<Coordinates>();

  const entities: React.ReactNode[] = useMapEntities(data.entities);
  const labels = useMapLabels(data);
  const layers = useMapLayers(data);

  const handleClear = React.useCallback(() => {
    setGoToPoint(undefined);
  }, []);

  const handleClick = React.useCallback(
    (position: [number, number]) => {
      const [x, y] = position;
      const scaledPosition: [number, number] = [
        Math.floor(x / data.pixelSize),
        Math.floor(y / data.pixelSize),
      ];
      // Check if point is outside map
      if (
        !data.layers
          .filter((layer) => layer.type !== 'wall')
          .some((layer) =>
            pairWiseArray(layer.pixels).some(
              (pixel) => manhatten(scaledPosition, pixel) === 0
            )
          )
      ) {
        return;
      }

      setGoToPoint({ x, y });
    },
    [data]
  );

  const goToMarker =
    goToPoint !== undefined ? (
      <Image
        key="GoToMarker"
        image={markerImage}
        minimumScale={1}
        {...goToPoint}
        offsetX={markerImage.width / 2}
        offsetY={markerImage.height}
        listening={false}
      />
    ) : undefined;

  return (
    <>
      <Map
        layers={layers}
        labels={labels}
        entities={entities.concat(goToMarker)}
        padding={padding}
        onClick={handleClick}
      />
      <LayerActionsContainer>
        <GoLayerOverlay goToPoint={goToPoint} onClear={handleClear} />
      </LayerActionsContainer>
    </>
  );
};

export default GoLayer;
