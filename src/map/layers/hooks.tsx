import { useTheme } from '@material-ui/core';
import React from 'react';
import { RawMapData, RawMapEntityType } from '../../api';
import { MapLabel, MapLayer } from '../Map';
import { FourColorTheoremSolver } from '../map-color-finder';
import { RawMapEntityShape } from '../shapes';
import { labelsFromMapData, getLayerColor, layersFromMapData } from './utils';

export const useMapLayers = (data: RawMapData): MapLayer[] => {
  const theme = useTheme();

  const fourColorTheoremSolver = React.useMemo(
    () => new FourColorTheoremSolver(data.layers, data.pixelSize),
    [data.layers, data.pixelSize]
  );

  const getColor = React.useMemo(
    () =>
      getLayerColor(
        theme.map,
        (id) =>
          theme.map.segment[fourColorTheoremSolver.getColor(id)] ??
          theme.map.segment[theme.map.segment.length - 1]
      ),
    [fourColorTheoremSolver, theme.map]
  );

  return React.useMemo(
    () => layersFromMapData(data.layers, data.pixelSize, getColor),
    [data, getColor]
  );
};

export const useMapLabels = (data: RawMapData): MapLabel[] => {
  return React.useMemo(() => labelsFromMapData(data.layers, data.pixelSize), [
    data.layers,
    data.pixelSize,
  ]);
};

export const useMapEntities = (
  entities: RawMapData['entities'],
  typeArray?: RawMapEntityType[]
): JSX.Element[] => {
  return React.useMemo(() => {
    const filteredArray = typeArray
      ? entities.filter(({ type }) => typeArray.includes(type))
      : entities;
    return filteredArray.map((entity, index) => (
      <RawMapEntityShape entity={entity} key={index} />
    ));
  }, [entities, typeArray]);
};
