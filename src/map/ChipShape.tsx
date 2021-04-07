import { useTheme } from '@material-ui/core';
import Konva from 'konva';
import { ShapeConfig } from 'konva/types/Shape';
import React from 'react';
import { KonvaNodeEvents, Shape } from 'react-konva';

export type ChipShapeProps = KonvaNodeEvents &
  Konva.ShapeConfig & {
    text: string;
    textFill?: string;
    fontSize?: string;
    fontFamily?: string;
    sceneFunc?: never;
    width?: never;
    height?: never;
  };

const ChipShape = (props: ChipShapeProps): JSX.Element => {
  const { ...shapeConfig } = props;
  const theme = useTheme();

  const sceneFunc = React.useCallback<Required<ShapeConfig>['sceneFunc']>(
    (context, shape) => {
      context.setAttr(
        'font',
        `  ${shape.getAttr('fontSize')} ${shape.getAttr('fontFamily')}`
      );
      context.setAttr('textBaseline', 'bottom');

      const text = shape.getAttr('text');
      const {
        width: width,
        fontBoundingBoxAscent: height,
      } = context.measureText(text);
      const radius = Math.min(width / 2, height / 2);

      context.translate(-width / 2, -height / 2);
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(width, 0);
      context.arc(
        width,
        height / 2,
        radius,
        (Math.PI * 3) / 2,
        Math.PI / 2,
        false
      );

      context.lineTo(radius, height);
      context.arc(
        0,
        height - radius,
        radius,
        Math.PI / 2,
        (Math.PI * 3) / 2,
        false
      );

      context.closePath;

      context.setAttr('fillStyle', shape.getAttr('fill'));
      context.fillStrokeShape(shape);

      context.translate(0, height);
      context.setAttr('fillStyle', shape.getAttr('textFill'));
      context.fillText(text, 0, 0);
    },
    []
  );

  return (
    <Shape
      fill={theme.palette.background.paper}
      textFill={theme.palette.text.primary}
      fontSize={theme.typography.body1.fontSize}
      fontFamily={theme.typography.fontFamily}
      {...shapeConfig}
      sceneFunc={sceneFunc}
    />
  );
};

export default ChipShape;
