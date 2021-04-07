import Konva from 'konva';
import { ShapeConfig } from 'konva/types/Shape';
import React from 'react';
import { KonvaNodeEvents, Shape } from 'react-konva';
import { pairWiseArray } from './utils';

export type PixelsProps = KonvaNodeEvents &
  Konva.ShapeConfig & {
    blockSize: number;
    points: number[];
    sceneFunc?: never;
    x?: never;
    y?: never;
    width?: never;
    height?: never;
  };

const Pixels = (props: PixelsProps): JSX.Element => {
  const sceneFunc = React.useCallback<Required<ShapeConfig>['sceneFunc']>(
    (context, shape) => {
      const blockSize = shape.getAttr('blockSize');
      const points = shape.getAttr('points');
      const coordinates = pairWiseArray(points);

      // For some reason, beginPath is the one that sets color.
      context.beginPath();
      context.closePath();

      coordinates.forEach(([x, y]) => {
        context.rect(x, y, blockSize, blockSize);
      });

      context.fillStrokeShape(shape);
    },
    []
  );

  return <Shape {...props} sceneFunc={sceneFunc} />;
};

export default Pixels;
