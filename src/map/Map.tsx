import { ThemeProvider, useTheme } from '@material-ui/core';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import React from 'react';
import { Layer } from 'react-konva';
import { FourColorTheoremSolver } from './map-color-finder';
import {
  RawMapLayer,
  RawMapLayerType,
  RawMapData,
  RawMapEntityType,
} from '../api';
import MapEntityShape from './MapEntityShape';
import MapStage from './MapStage';
import Pixels from './Pixels';
import ChipShape from './ChipShape';
import { inside, pairWiseArray, pointClosestTo } from './utils';
import robotSrc from '../assets/icons/robot.svg';
import cleaningServicesSrc from '../assets/icons/cleaning_services.svg';
import { useMapContext } from './MapContextProvider';
import Color from 'color';

const robotImage = new window.Image();
robotImage.src = robotSrc;

const cleaningServices = new window.Image();
cleaningServices.src = cleaningServicesSrc;

export interface MapProps {
  mapData: RawMapData;
}

const Map = (props: MapProps): JSX.Element => {
  const { mapData } = props;
  // TODO: Validate mapData.metaData.version
  const { layers, entities, pixelSize } = mapData;
  const {
    onMapInteraction,
    goToPoint,
    selectedLayer,
    selectedSegments,
  } = useMapContext();
  const stageRef = React.useRef<{ redraw(): void }>(null);
  const theme = useTheme();

  React.useEffect(() => {
    stageRef?.current?.redraw();
  }, [entities, goToPoint]);

  const fourColorTheoremSolver = React.useMemo(
    () => new FourColorTheoremSolver(layers, pixelSize),
    [layers, pixelSize]
  );

  const getColor = React.useMemo(() => {
    return (layer: RawMapLayer): NonNullable<React.CSSProperties['color']> => {
      const { floor: floor, wall: wall, segment } = theme.map;
      switch (layer.type) {
        case RawMapLayerType.Floor:
          return floor;
        case RawMapLayerType.Wall:
          return wall;
        case RawMapLayerType.Segment: {
          const { segmentId } = layer.metaData;
          const fallback = segment[segment.length - 1];
          if (segmentId === undefined) {
            return fallback;
          }

          const color =
            segment[fourColorTheoremSolver.getColor(segmentId)] ?? fallback;
          if (
            selectedLayer !== 'segments' ||
            selectedSegments?.includes(segmentId)
          ) {
            return color;
          }

          return Color(color).desaturate(0.7).hex();
        }
      }
    };
  }, [fourColorTheoremSolver, selectedLayer, selectedSegments, theme.map]);

  const handleMapInteraction = React.useCallback(
    (event: KonvaEventObject<TouchEvent | MouseEvent>) => {
      const { currentTarget: stage } = event;
      if (!(stage instanceof Konva.Stage)) {
        return;
      }

      const pointer = stage.getPointerPosition() ?? { x: 0, y: 0 };
      const position = {
        x: Math.floor(
          (pointer.x - stage.x()) / stage.scaleX() + stage.offsetX()
        ),
        y: Math.floor(
          (pointer.y - stage.y()) / stage.scaleY() + stage.offsetY()
        ),
      };

      const layerX = Math.floor(position.x / pixelSize);
      const layerY = Math.floor(position.y / pixelSize);

      const layer = layers.find(
        ({ pixels, dimensions }) =>
          inside([layerX, layerY], dimensions) &&
          pairWiseArray(pixels).some(([x, y]) => x === layerX && y === layerY)
      );
      if (layer === undefined) {
        return;
      }

      onMapInteraction(layer, position);
    },
    [onMapInteraction, layers, pixelSize]
  );

  const entitiesWithoutRobot = entities.filter(
    (e) => e.type !== RawMapEntityType.RobotPosition
  );
  const robot = entities.find((x) => x.type === RawMapEntityType.RobotPosition);

  return (
    <MapStage
      ref={stageRef}
      style={{ fontSize: theme.typography.body1.fontSize }}
      mapData={mapData}
      onClick={handleMapInteraction}
      onTouchEnd={handleMapInteraction}
    >
      {/*
        We have to provide the theme here to "bridge" the Stage.
        See: https://github.com/konvajs/react-konva#usage-with-react-context
      */}
      <ThemeProvider theme={theme}>
        <Layer listening={false}>
          {layers.map((layer) => (
            <Pixels
              key={`${layer.type}:${layer.metaData.segmentId}`}
              pixels={layer.pixels}
              scaleX={pixelSize}
              scaleY={pixelSize}
              fill={getColor(layer)}
            />
          ))}
          {entitiesWithoutRobot.map((entity, index) => (
            <MapEntityShape
              key={index.toString()}
              active={true}
              entity={entity}
              pixelSize={pixelSize}
            />
          ))}
          {goToPoint && (
            <MapEntityShape
              entity={{
                metaData: {},
                points: [goToPoint.x, goToPoint.y],
                type: RawMapEntityType.GoToTarget,
              }}
              active={false}
              pixelSize={pixelSize}
            />
          )}
          {robot && <MapEntityShape entity={robot} pixelSize={pixelSize} />}
          {layers
            .filter((layer) => layer.type === RawMapLayerType.Segment)
            .map(({ metaData, type, dimensions, pixels }) => {
              const [x, y] = pointClosestTo(pairWiseArray(pixels), [
                dimensions.x.mid,
                dimensions.y.mid,
              ]);

              return (
                <ChipShape
                  key={`${type}:${metaData.segmentId}`}
                  text={metaData.name ?? `# ${metaData.segmentId}`}
                  icon={metaData.active ? cleaningServices : undefined}
                  x={x * pixelSize}
                  y={y * pixelSize}
                />
              );
            })}
        </Layer>
      </ThemeProvider>
    </MapStage>
  );
};

export default Map;
