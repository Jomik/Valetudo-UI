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
import { pairWiseArray, pointClosestTo } from './utils';
import { Vector2d } from 'konva/types/types';
import MapMenu, { MapMenuProps } from './MapMenu';
import robotSrc from '../assets/icons/robot.svg';
import cleaningServicesSrc from '../assets/icons/cleaning_services.svg';

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
  const theme = useTheme();

  const [menu, setMenu] = React.useState<Omit<MapMenuProps, 'onClose'>>({
    open: false,
  });

  const handleCloseMenu = React.useCallback(() => {
    setMenu((prev) => ({ ...prev, open: false }));
  }, []);

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
          const fallback = segment[segment.length - 1];
          if (layer.metaData.segmentId === undefined) {
            return fallback;
          }

          return (
            segment[
              fourColorTheoremSolver.getColor(layer.metaData.segmentId)
            ] ?? fallback
          );
        }
      }
    };
  }, [fourColorTheoremSolver, theme.map]);

  const getLayerFromPosition = React.useCallback(
    (position: Vector2d): RawMapLayer | undefined => {
      const targetX = Math.floor(position.x / pixelSize);
      const targetY = Math.floor(position.y / pixelSize);

      return layers.find((layer) =>
        pairWiseArray(layer.pixels).some(
          ([x, y]) => x === targetX && y === targetY
        )
      );
    },
    [layers, pixelSize]
  );

  const handleMapInteraction = React.useCallback(
    (event: KonvaEventObject<TouchEvent | MouseEvent>) => {
      const { currentTarget: stage } = event;
      if (!(stage instanceof Konva.Stage)) {
        return;
      }

      const pointer = stage.getPointerPosition() ?? { x: 0, y: 0 };
      const stagePosition = {
        x: (pointer.x - stage.x()) / stage.scaleX() + stage.offsetX(),
        y: (pointer.y - stage.y()) / stage.scaleY() + stage.offsetY(),
      };

      const layer = getLayerFromPosition(stagePosition);

      if (layer === undefined || layer.type === 'wall') {
        return;
      }
      event.evt.preventDefault();

      let position: Vector2d;
      if ('changedTouches' in event.evt) {
        const { clientX, clientY } = event.evt.changedTouches[0];
        position = {
          x: clientX,
          y: clientY,
        };
      } else {
        const { x, y } = event.evt;
        position = { x, y };
      }

      setMenu({
        open: true,
        anchorPosition: {
          left: position.x,
          top: position.y,
        },
        position: stagePosition,
        segment:
          layer.type === RawMapLayerType.Segment ? layer.metaData : undefined,
      });
    },
    [getLayerFromPosition]
  );

  const entitiesWithoutRobot = entities.filter(
    (e) => e.type !== RawMapEntityType.RobotPosition
  );
  const robot = entities.find((x) => x.type === RawMapEntityType.RobotPosition);

  return (
    <>
      <MapMenu {...menu} onClose={handleCloseMenu} />
      <MapStage
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
            {layers.map((layer, index) => (
              <Pixels
                key={`${layer.type}:${layer.metaData.segmentId ?? index}`}
                pixels={layer.pixels}
                scaleX={pixelSize}
                scaleY={pixelSize}
                fill={getColor(layer)}
              />
            ))}
          </Layer>
          <Layer listening={false}>
            {entitiesWithoutRobot.map((entity, index) => (
              <MapEntityShape
                key={index.toString()}
                entity={entity}
                pixelSize={pixelSize}
              />
            ))}
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
    </>
  );
};

export default Map;
