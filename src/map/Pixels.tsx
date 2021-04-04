import { ShapeConfig } from 'konva/types/Shape';
import React from 'react';
import { Shape } from 'react-konva';
import { pairWiseArray } from './utils';

interface PixelsProps {
  pixelSize: number;
  pixels: number[];
  color: string;
}

const Pixels = (props: PixelsProps): JSX.Element => {
  const { pixels, pixelSize, color } = props;

  const coordinates = React.useMemo(() => pairWiseArray(pixels), [pixels]);
  const sceneFunc = React.useCallback<Required<ShapeConfig>['sceneFunc']>(
    (context, shape) => {
      const width = shape.getAttr('width');
      const height = shape.getAttr('height');

      // For some reason, beginPath is the one that sets color.
      context.beginPath();
      context.closePath();

      coordinates.forEach(([x, y]) => {
        context.rect(x, y, width, height);
      });

      context.fillStrokeShape(shape);
    },
    [coordinates]
  );

  return (
    <Shape
      sceneFunc={sceneFunc}
      preventDefault={false}
      fill={color}
      width={pixelSize}
      height={pixelSize}
    />
  );
};

export default Pixels;
