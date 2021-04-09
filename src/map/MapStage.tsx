import Konva from 'konva';
import { KonvaEventObject, Node } from 'konva/types/Node';
import { Vector2d } from 'konva/types/types';
import React from 'react';
import { Stage, StageProps } from 'react-konva';
import { useHTMLElement } from '../hooks';
import { MapData } from '../api';
import {
  bound,
  getCenter,
  getDistance,
  isTouchEnabled,
  ZeroVector,
} from './utils';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  container: {
    height: '100%',
    width: '100%',
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
}));
export type MapStageProps = StageProps & {
  children: JSX.Element;
  mapData: MapData;
  width?: never;
  height?: never;
  scaleX?: never;
  scaleY?: never;
  offsetX?: never;
  offsetY?: never;
};

const scalePersistentNodes = (stage: Konva.Stage) => {
  stage
    .find(
      (node: Node) =>
        node.getAttr('minimumScale') !== undefined ||
        node.getAttr('maximumScale')
    )
    .each((shape) => {
      const stageScaleX = stage.scaleX();
      const stageScaleY = stage.scaleY();
      const minimumScale = shape.getAttr('minimumScale') ?? -Infinity;
      const maximumScale = shape.getAttr('maximumScale') ?? Infinity;
      shape.scale({
        x: bound(stageScaleX, minimumScale, maximumScale) / stageScaleX,
        y: bound(stageScaleY, minimumScale, maximumScale) / stageScaleY,
      });
    });
};

const MapPadding = 10;
const ScaleBound = 10;

const MapStage = (props: MapStageProps): JSX.Element => {
  const {
    children,
    mapData,
    onWheel,
    onTouchMove,
    onTouchEnd,
    ...stageConfig
  } = props;
  const { layers, pixelSize } = mapData;
  const classes = useStyles();
  const lastCenter = React.useRef<Vector2d | null>(null);
  const lastDragCenter = React.useRef<Vector2d | null>(null);
  const lastDist = React.useRef<number>(0);

  // TODO: Remove this when Valetudo does not return empty layers.
  const filteredLayers = React.useMemo(
    () => layers.filter((layer) => layer.metaData.area > 0),
    [layers]
  );

  const { minX, minY, maxX, maxY } = React.useMemo(
    () => ({
      minX: Math.min(...filteredLayers.map((layer) => layer.dimensions.x.min)),
      maxX: Math.max(...filteredLayers.map((layer) => layer.dimensions.x.max)),
      minY: Math.min(...filteredLayers.map((layer) => layer.dimensions.y.min)),
      maxY: Math.max(...filteredLayers.map((layer) => layer.dimensions.y.max)),
    }),
    [filteredLayers]
  );

  const mapWidth = (maxX - minX + MapPadding * 2) * pixelSize;
  const mapHeight = (maxY - minY + MapPadding * 2) * pixelSize;

  const [containerRef, { containerWidth, containerHeight }] = useHTMLElement(
    { containerWidth: mapWidth, containerHeight: mapHeight },
    React.useCallback(
      (element: HTMLDivElement) => ({
        containerWidth: element.offsetWidth,
        containerHeight: element.offsetHeight,
      }),
      []
    )
  );
  const stageRef = React.useRef<Konva.Stage>(null);

  const stageScaleWidth = containerWidth / mapWidth;
  const stageScaleHeight = containerHeight / mapHeight;
  const stageScale =
    stageScaleWidth < stageScaleHeight ? stageScaleWidth : stageScaleHeight;

  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    if (stage === null) {
      return;
    }
    scalePersistentNodes(stage);
    stage.batchDraw();
  }, [stageScale]);

  const scaleStage = React.useCallback(
    (
      stage: Konva.Stage,
      center: Vector2d,
      scaleDelta: number,
      centerDelta: Vector2d = ZeroVector
    ) => {
      const currentScale = stage.scaleX();

      // local coordinates of center point
      const localCenter = {
        x: (center.x - stage.x()) / currentScale,
        y: (center.y - stage.y()) / currentScale,
      };

      const newScale = bound(
        currentScale * scaleDelta,
        stageScale,
        stageScale * ScaleBound
      );

      const newPos = {
        x: center.x - localCenter.x * newScale + centerDelta.x,
        y: center.y - localCenter.y * newScale + centerDelta.y,
      };

      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);

      scalePersistentNodes(stage);

      stage.batchDraw();
    },
    [stageScale]
  );

  const handleScroll = React.useCallback(
    (event: KonvaEventObject<WheelEvent>) => {
      onWheel?.(event);
      if (event.evt.defaultPrevented) {
        return;
      }

      event.evt.preventDefault();
      const { currentTarget: stage } = event;
      if (!(stage instanceof Konva.Stage)) {
        return;
      }

      scaleStage(
        stage,
        stage.getPointerPosition() ?? ZeroVector,
        (100 - event.evt.deltaY) / 100
      );
    },
    [onWheel, scaleStage]
  );

  const handleTouchMove = React.useCallback(
    (event: KonvaEventObject<TouchEvent>) => {
      onTouchMove?.(event);
      if (event.evt.defaultPrevented) {
        return;
      }

      event.evt.preventDefault();
      const { currentTarget: stage } = event;

      if (!(stage instanceof Konva.Stage)) {
        return;
      }

      if (event.evt.touches.length === 1) {
        const [touch1] = event.evt.touches;
        const p1 = { x: touch1.clientX, y: touch1.clientY };
        if (lastDragCenter.current === null) {
          lastDragCenter.current = p1;
          return;
        }

        stage.position({
          x: stage.x() + p1.x - lastDragCenter.current.x,
          y: stage.y() + p1.y - lastDragCenter.current.y,
        });

        stage.batchDraw();

        lastDragCenter.current = p1;
        return;
      }

      if (event.evt.touches.length !== 2) {
        return;
      }

      const [touch1, touch2] = event.evt.touches;
      const p1 = { x: touch1.clientX, y: touch1.clientY };
      const p2 = { x: touch2.clientX, y: touch2.clientY };
      const newCenter = getCenter(p1, p2);
      const dist = getDistance(p1, p2);

      if (!lastCenter.current) {
        lastCenter.current = newCenter;
      }
      if (!lastDist.current) {
        lastDist.current = dist;
      }

      const scaleDelta = dist / lastDist.current;
      const centerDelta = {
        x: newCenter.x - lastCenter.current.x,
        y: newCenter.y - lastCenter.current.y,
      };

      scaleStage(stage, lastCenter.current, scaleDelta, centerDelta);

      lastDist.current = dist;
      lastCenter.current = newCenter;
    },
    [onTouchMove, scaleStage]
  );

  const handleTouchEnd = React.useCallback(
    (event: KonvaEventObject<TouchEvent>) => {
      lastDist.current = 0;

      if (lastDragCenter.current !== null || lastCenter.current !== null) {
        lastCenter.current = null;
        lastDragCenter.current = null;
        event.evt.preventDefault();
        return;
      }

      onTouchEnd?.(event);
    },
    [onTouchEnd]
  );

  return (
    <div ref={containerRef} className={classes.container}>
      <Stage
        ref={stageRef}
        draggable={!isTouchEnabled}
        {...stageConfig}
        onWheel={handleScroll}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        width={containerWidth}
        height={containerHeight}
        scaleX={stageScale}
        scaleY={stageScale}
        // TODO: Avoid using offset
        offsetX={(minX - MapPadding) * pixelSize}
        offsetY={(minY - MapPadding) * pixelSize}
      >
        {children}
      </Stage>
    </div>
  );
};

export default MapStage;
