import { useTheme } from '@material-ui/core';
import React from 'react';
import { RawMapData, RawMapLayer, RawMapLayerType } from '../../api';
import Map, { MapLabel, MapLayer, MapProps } from '../Map';
import { FourColorTheoremSolver } from '../map-color-finder';
import { RawMapEntityShape } from '../shapes';
import { pointClosestTo, pairWiseArray, inside } from '../utils';
import { useRobotMapLayerContext } from './RobotControlMapProvider';
import Color from 'color';
import RobotMapLayers from './RobotMapLayers';

import cleaningServicesSrc from '../shapes/assets/cleaning_services.svg';
const cleaningServices = new window.Image();
cleaningServices.src = cleaningServicesSrc;

import markerSrc from '../shapes/assets/marker.svg';
import { Image } from 'react-konva';
const markerImage = new window.Image();
markerImage.src = markerSrc;

export interface RobotControlMapProps
  extends Omit<MapProps, 'layers' | 'entities' | 'labels' | 'onLayerClick'> {
  data: RawMapData;
}

const RobotControlMap = (props: RobotControlMapProps): JSX.Element => {
  const { data, ...mapProps } = props;
  const theme = useTheme();
  const {
    onMapInteraction,
    selectedLayer,
    selectedSegments,
    goToPoint,
  } = useRobotMapLayerContext();

  const fourColorTheoremSolver = React.useMemo(
    () => new FourColorTheoremSolver(data.layers, data.pixelSize),
    [data.layers, data.pixelSize]
  );

  const layers = React.useMemo<MapLayer[]>(() => {
    const getColor = (
      layer: RawMapLayer
    ): NonNullable<React.CSSProperties['color']> => {
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
            selectedSegments.includes(segmentId)
          ) {
            return color;
          }
          return Color(color).desaturate(0.7).hex();
        }
      }
    };

    return data.layers.map((layer) => {
      const { pixels, dimensions, type, metaData } = layer;

      return {
        id: metaData.segmentId ?? type,
        pixels,
        pixelSize: data.pixelSize,
        dimensions: {
          x: [dimensions.x.min, dimensions.x.max],
          y: [dimensions.y.min, dimensions.y.max],
        },
        color: getColor(layer),
      };
    });
  }, [
    data.layers,
    data.pixelSize,
    fourColorTheoremSolver,
    selectedLayer,
    selectedSegments,
    theme.map,
  ]);

  const labels = React.useMemo<MapLabel[]>(
    () =>
      data.layers
        .filter((layer) => layer.type === 'segment')
        .map((layer) => {
          const { pixels, dimensions, metaData } = layer;
          const { name, segmentId, active } = metaData;
          const [x, y] = pointClosestTo(pairWiseArray(pixels), [
            dimensions.x.mid,
            dimensions.y.mid,
          ]);

          return {
            text: name ?? segmentId ?? '?',
            position: [x * data.pixelSize, y * data.pixelSize],
            icon: active ? cleaningServices : undefined,
          };
        }),
    [data.layers, data.pixelSize]
  );

  const entities = React.useMemo<JSX.Element[]>(
    () =>
      data.entities.map((entity, index) => (
        <RawMapEntityShape key={index} entity={entity} />
      )),
    [data.entities]
  );

  const goToMarker =
    goToPoint !== undefined ? (
      <Image
        key="gotopoint"
        image={markerImage}
        minimumScale={1}
        {...goToPoint}
        offsetX={markerImage.width / 2}
        offsetY={markerImage.height}
        listening={false}
      />
    ) : undefined;

  const handleClick = React.useCallback(
    (position: [number, number]) => {
      const [x, y] = position;
      const layerX = Math.floor(x / data.pixelSize);
      const layerY = Math.floor(y / data.pixelSize);

      const segment = data.layers
        .filter((layer) => layer.type === 'segment')
        .find(
          ({ pixels, dimensions }) =>
            inside([layerX, layerY], {
              x: [dimensions.x.min, dimensions.x.max],
              y: [dimensions.y.min, dimensions.y.max],
            }) &&
            pairWiseArray(pixels).some(([x, y]) => x === layerX && y === layerY)
        );

      onMapInteraction({ x, y }, segment?.metaData?.segmentId);
    },
    [data.layers, data.pixelSize, onMapInteraction]
  );

  return (
    <RobotMapLayers>
      <Map
        {...mapProps}
        entities={goToMarker ? [...entities, goToMarker] : entities}
        layers={layers}
        labels={labels}
        onClick={handleClick}
      />
    </RobotMapLayers>
  );
};

export default RobotControlMap;
