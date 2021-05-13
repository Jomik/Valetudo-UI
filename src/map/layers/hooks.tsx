import { useTheme } from '@material-ui/core';
import React from 'react';
import { RawMapData } from '../../api';
import { MapLabel, MapLayer } from '../Map';
import { FourColorTheoremSolver } from '../map-color-finder';
import { RawMapEntityShape } from '../shapes';
import { labelsFromMapData, getLayerColor, layersFromMapData } from './utils';

export const useDefaultMapData = (
  data: RawMapData
): {
  layers: MapLayer[];
  entities: React.ReactNode[];
  labels: MapLabel[];
} => {
  const theme = useTheme();

  const labels = React.useMemo(() => labelsFromMapData(data), [data]);

  const entities = React.useMemo<React.ReactNode[]>(
    () =>
      data.entities.map((entity, index) => (
        <RawMapEntityShape key={index} entity={entity} />
      )),
    [data.entities]
  );

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

  const layers = React.useMemo(() => layersFromMapData(data, getColor), [
    data,
    getColor,
  ]);

  return {
    labels,
    entities,
    layers,
  };
};
