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
    checked?: boolean;
  };

const drawCheckMark = (
  context: Konva.Context,
  shape: Konva.Shape,
  scale: number
) => {
  context.scale(scale, scale);
  context.setAttr('fillStyle', shape.getAttr('activeFill'));
  context.beginPath();
  context.moveTo(9, 16.2);
  context.lineTo(4.8, 12);
  context.lineTo(4.8 - 1.4, 12 + 1.4);
  context.lineTo(9, 19);
  context.lineTo(21, 7);
  context.lineTo(21 - 1.4, 7 - 1.4);
  context.lineTo(9, 16.2);
  context.closePath();

  context.fill();
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
      const checked = shape.getAttr('checked');
      const {
        width: textWidth,
        fontBoundingBoxAscent: height,
      } = context.measureText(text);
      const checkScale = height / 24;
      const width = textWidth + (checked ? checkScale * 20 : 0);
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

      if (checked) {
        context.translate(width - 20 * checkScale, -height);
        drawCheckMark(context, shape, checkScale);
      }
    },
    []
  );

  return (
    <Shape
      fill={theme.palette.background.paper}
      textFill={theme.palette.text.primary}
      activeFill={theme.palette.success.main}
      fontSize={theme.typography.h6.fontSize}
      fontFamily={theme.typography.fontFamily}
      persistentScale={1}
      checked={false}
      {...shapeConfig}
      sceneFunc={sceneFunc}
    />
  );
};

export default ChipShape;
