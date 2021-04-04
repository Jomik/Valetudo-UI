import { Container } from '@material-ui/core';
import { ThemeProvider, useTheme } from '@material-ui/core/styles';
import React from 'react';
import { Layer, Stage } from 'react-konva';
import { useHTMLElement } from '../hooks';
import { FourColorTheoremSolver } from './map-color-finder';
import { MapLayer as MapLayer, MapLayerType, MapData } from './MapData';
import MapEntityShape from './MapEntityShape';
import Pixels from './Pixels';

export interface MapProps {
  mapData: MapData;
}

const MapPadding = 10;
const Map = (props: MapProps): JSX.Element => {
  const { mapData } = props;
  // TODO: Validate mapData.metaData.version
  const { layers, entities, pixelSize } = mapData;
  // TODO: Remove this when Valetudo does not return empty layers.
  const filteredLayers = layers.filter((layer) => layer.metaData.area > 0);
  const theme = useTheme();
  const [containerRef, containerWidth] = useHTMLElement(
    0,
    React.useCallback((element: HTMLDivElement) => element.offsetWidth, [])
  );

  const minX = Math.min(
    ...filteredLayers.map((layer) => layer.dimensions.x.min)
  );
  const maxX = Math.max(
    ...filteredLayers.map((layer) => layer.dimensions.x.max)
  );
  const minY = Math.min(
    ...filteredLayers.map((layer) => layer.dimensions.y.min)
  );
  const maxY = Math.max(
    ...filteredLayers.map((layer) => layer.dimensions.y.max)
  );

  const stageWidth = (maxX - minX + MapPadding * 2) * pixelSize;
  const stageHeight = (maxY - minY + MapPadding * 2) * pixelSize;

  const scale = containerWidth / stageWidth;

  const getColor = React.useMemo(() => {
    const colorFinder = new FourColorTheoremSolver(filteredLayers, 6);
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
  }, [filteredLayers, theme.map]);

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
        {/*
          We have to provide the theme here to "bridge" the Stage.
          See: https://github.com/konvajs/react-konva#usage-with-react-context
        */}
        <ThemeProvider theme={theme}>
          <Layer>
            {filteredLayers.map((layer) => (
              <Pixels
                pixels={layer.pixels.map((p) => p * pixelSize)}
                color={getColor(layer)}
                pixelSize={pixelSize}
                key={`${layer.type}:${layer.metaData.segmentId}`}
              />
            ))}
          </Layer>
          <Layer>
            {entities.map((entity, index) => (
              <MapEntityShape
                key={index.toString()}
                entity={entity}
                pixelSize={pixelSize}
              />
            ))}
          </Layer>
        </ThemeProvider>
      </Stage>
    </Container>
  );
};

export default Map;
