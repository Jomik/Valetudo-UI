import { ThemeProvider, useTheme } from '@material-ui/core/styles';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import React from 'react';
import { Layer } from 'react-konva';
import { FourColorTheoremSolver } from './map-color-finder';
import {
  MapLayer as MapLayer,
  MapLayerType,
  MapData,
  MapLayerMetaData,
} from './MapData';
import MapEntityShape from './MapEntityShape';
import MapStage from './MapStage';
import Pixels from './Pixels';

import robotSrc from '../assets/icons/robot.svg';
import ChipShape from './ChipShape';
import { pairWiseArray, pointClosestTo } from './utils';

const robotImage = new window.Image();
robotImage.src = robotSrc;
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

  const handleClick = React.useCallback(
    (event: KonvaEventObject<MouseEvent>) => {
      const { currentTarget: stage, target } = event;

      if (!(stage instanceof Konva.Stage) || !(target instanceof Konva.Shape)) {
        return;
      }

      const { type, metaData } = target.attrs as {
        type?: string;
        metaData?: MapLayerMetaData;
      };

      const pointer = stage.getPointerPosition() ?? { x: 0, y: 0 };
      const stagePosition = {
        x: (pointer.x - stage.x()) / stage.scaleX(),
        y: (pointer.y - stage.y()) / stage.scaleY(),
      };

      console.log(type, metaData);
      console.log('pos', stagePosition);
    },
    []
  );

  return (
    <MapStage mapData={mapData} onClick={handleClick}>
      {/*
        We have to provide the theme here to "bridge" the Stage.
        See: https://github.com/konvajs/react-konva#usage-with-react-context
      */}
      <ThemeProvider theme={theme}>
        <Layer>
          {layers.map((layer, index) => (
            <Pixels
              key={`${layer.type}:${layer.metaData.segmentId ?? index}`}
              points={layer.pixels.map((p) => p * pixelSize)}
              blockSize={pixelSize}
              fill={getColor(layer)}
              metaData={layer.metaData}
              type={layer.type}
            />
          ))}
        </Layer>
        <Layer listening={false}>
          {entities.map((entity, index) => (
            <MapEntityShape
              key={index.toString()}
              entity={entity}
              pixelSize={pixelSize}
            />
          ))}
          {layers
            .filter((layer) => layer.type === MapLayerType.Segment)
            .map((layer) => {
              const point = pointClosestTo(pairWiseArray(layer.pixels), [
                layer.dimensions.x.mid,
                layer.dimensions.y.mid,
              ]);
              return (
                <ChipShape
                  key={`${layer.type}:${layer.metaData.segmentId}`}
                  text={layer.metaData.name ?? `# ${layer.metaData.segmentId}`}
                  checked={layer.metaData.active}
                  x={point[0] * pixelSize}
                  y={point[1] * pixelSize}
                />
              );
            })}
        </Layer>
      </ThemeProvider>
    </MapStage>
  );
};

export default Map;
