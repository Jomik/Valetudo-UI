import { ThemeProvider, useTheme } from '@material-ui/core/styles';
import React from 'react';
import { Layer } from 'react-konva';
import { FourColorTheoremSolver } from './map-color-finder';
import { MapLayer as MapLayer, MapLayerType, MapData } from './MapData';
import MapEntityShape from './MapEntityShape';
import MapStage from './MapStage';
import Pixels from './Pixels';

export interface MapProps {
  mapData: MapData;
}

const Map = (props: MapProps): JSX.Element => {
  const { mapData } = props;
  // TODO: Validate mapData.metaData.version
  const { layers, entities, pixelSize } = mapData;
  const theme = useTheme();

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
    <MapStage mapData={mapData}>
      {/*
        We have to provide the theme here to "bridge" the Stage.
        See: https://github.com/konvajs/react-konva#usage-with-react-context
      */}
      <ThemeProvider theme={theme}>
        <Layer>
          {layers.map((layer) => (
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
    </MapStage>
  );
};

export default Map;
