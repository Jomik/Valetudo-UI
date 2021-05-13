import {
  CircularProgress,
  Fade,
  Grid,
  Typography,
  Zoom,
} from '@material-ui/core';
import React from 'react';
import { useCleanSegmentsMutation, useRobotStatus } from '../../api';
import Map from '../Map';
import { LayerActionsContainer, LayerActionButton } from './Styled';
import { MapLayersProps } from './types';
import { manhatten, pairWiseArray } from '../utils';
import Color from 'color';
import { useMapLabels, useMapLayers } from './hooks';

interface SegmentsLayerOverlayProps {
  segments: string[];
  onClear(): void;
}

const SegmentsLayerOverlay = (
  props: SegmentsLayerOverlayProps
): JSX.Element => {
  const { segments, onClear } = props;
  const { data: status } = useRobotStatus((state) => state.value);
  const { mutate, isLoading } = useCleanSegmentsMutation({
    onSuccess: onClear,
  });

  const canClean = status === 'idle' || status === 'docked';
  const didSelectSegments = segments.length > 0;

  const handleClick = React.useCallback(() => {
    if (!didSelectSegments || !canClean) {
      return;
    }

    mutate(segments);
  }, [canClean, didSelectSegments, mutate, segments]);

  return (
    <Grid container alignItems="center" spacing={1} direction="row-reverse">
      <Grid item>
        <Zoom in>
          <LayerActionButton
            disabled={!didSelectSegments || isLoading || !canClean}
            color="inherit"
            size="medium"
            variant="extended"
            onClick={handleClick}
          >
            Clean {segments.length} segments
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
        <Fade in={didSelectSegments && !isLoading}>
          <LayerActionButton
            color="inherit"
            size="medium"
            variant="extended"
            onClick={onClear}
          >
            Clear
          </LayerActionButton>
        </Fade>
      </Grid>
      <Grid item>
        <Fade in={didSelectSegments && !canClean}>
          <Typography variant="caption" color="textSecondary">
            Can only start segment cleaning when idle
          </Typography>
        </Fade>
      </Grid>
    </Grid>
  );
};

const SegmentsLayer = (props: MapLayersProps): JSX.Element => {
  const { data, padding } = props;
  const [selectedSegments, setSelectedSegments] = React.useState<string[]>([]);

  const layers = useMapLayers(data);
  const labels = useMapLabels(data);

  const handleClear = React.useCallback(() => {
    setSelectedSegments([]);
  }, []);

  const handleClick = React.useCallback(
    (position: [number, number]) => {
      const [x, y] = position;
      const scaledPosition: [number, number] = [
        Math.floor(x / data.pixelSize),
        Math.floor(y / data.pixelSize),
      ];

      const segment = data.layers
        .filter((layer) => layer.type === 'segment')
        .find((layer) =>
          pairWiseArray(layer.pixels).some(
            (pixel) => manhatten(scaledPosition, pixel) === 0
          )
        );
      const segmentId = segment?.metaData.segmentId;
      if (segmentId === undefined) {
        return;
      }

      setSelectedSegments((prev) => {
        if (prev.includes(segmentId)) {
          return prev.filter((v) => v !== segmentId);
        }

        return [...prev, segmentId];
      });
    },
    [data]
  );

  const coloredLayers = React.useMemo(
    () =>
      layers.map((layer) =>
        selectedSegments.includes(layer.id)
          ? layer
          : { ...layer, color: Color(layer.color).desaturate(0.7).hex() }
      ),
    [layers, selectedSegments]
  );

  return (
    <>
      <Map
        layers={coloredLayers}
        labels={labels}
        padding={padding}
        onClick={handleClick}
      />
      <LayerActionsContainer>
        <SegmentsLayerOverlay
          onClear={handleClear}
          segments={selectedSegments}
        />
      </LayerActionsContainer>
    </>
  );
};

export default SegmentsLayer;
