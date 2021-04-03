import { Container, useTheme } from '@material-ui/core';
import React from 'react';
import { Layer, Rect, Stage } from 'react-konva';
import { useHTMLElement } from '../hooks';
import { FourColorTheoremSolver } from './map-color-finder';
import { MapLayer as MapLayer, MapLayerType, MapData } from './MapData';
import Pixels from './Pixels';

type MapProps = {
  mapData: MapData;
};

const MapPadding = 10;
const Map = (props: MapProps): JSX.Element => {
  const { mapData } = props;
  const { layers, pixelSize } = mapData;
  const [containerRef, containerWidth] = useHTMLElement(
    0,
    React.useCallback((element: HTMLDivElement) => element.offsetWidth, []),
  );
  const theme = useTheme();

  const minX = Math.min(...layers.map((layer) => layer.dimensions.x.min));
  const maxX = Math.max(...layers.map((layer) => layer.dimensions.x.max));
  const minY = Math.min(...layers.map((layer) => layer.dimensions.y.min));
  const maxY = Math.max(...layers.map((layer) => layer.dimensions.y.max));

  const stageWidth = (maxX - minX + MapPadding * 2) * pixelSize;
  const stageHeight = (maxY - minY + MapPadding * 2) * pixelSize;

  const scale = containerWidth / stageWidth;

  const getColor = React.useMemo(() => {
    const colorFinder = new FourColorTheoremSolver(layers, 6);
    return (layer: MapLayer): NonNullable<React.CSSProperties['color']> => {
      const {
        free,
        occupied,
        segment1,
        segment2,
        segment3,
        segment4,
        segmentFallback,
      } = theme.map;
      switch (layer.type) {
      case MapLayerType.Floor:
        return free;
      case MapLayerType.Wall:
        return occupied;
      case MapLayerType.Segment:
        if (layer.metaData.segmentId === undefined) {
          return segmentFallback;
        }

        return (
          [segment1, segment2, segment3, segment4][
            colorFinder.getColor(layer.metaData.segmentId)
          ] ?? segmentFallback
        );
      }
    };
  }, [layers, theme.map]);

  return (
    <Container ref={containerRef}>
      <Stage
        width={stageWidth * scale}
        height={stageHeight * scale}
        scaleX={scale}
        scaleY={scale}
        offsetX={(minX - MapPadding) * pixelSize}
        offsetY={(minY - MapPadding) * pixelSize}
        preventDefault={false}
      >
        <Layer>
          <Rect
            x={0}
            y={0}
            width={stageWidth * scale}
            height={stageHeight * scale}
            fill="green"
          />
          {layers.map((layer) => (
            <Pixels
              pixels={layer.pixels.map((p) => p * pixelSize)}
              color={getColor(layer)}
              pixelSize={pixelSize}
              key={`${layer.type}:${layer.metaData.segmentId}`}
            />
          ))}
        </Layer>
      </Stage>
    </Container>
  );
};

export default Map;
