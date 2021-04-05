import { createStyles, makeStyles } from '@material-ui/core/styles';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/types/Node';
import { Vector2d } from 'konva/types/types';
import React from 'react';
import { Stage } from 'react-konva';
import { useHTMLElement } from '../hooks';
import { MapData } from './MapData';
import { bound } from './utils';

const ZeroVector: Vector2d = { x: 0, y: 0 };

const getDistance = (p1: Vector2d, p2: Vector2d): number =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

const getCenter = (p1: Vector2d, p2: Vector2d): Vector2d => ({
  x: (p1.x + p2.x) / 2,
  y: (p1.y + p2.y) / 2,
});

const isTouchEnabled =
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0;

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      flex: '1 1 auto',
    },
  })
);

export interface MapStageProps {
  children: JSX.Element;
  mapData: MapData;
}

// Do this to properly handle drag on touch devices.
Konva.hitOnDragEnabled = isTouchEnabled;

const MapPadding = 10;
const ScaleBound = 10;

const MapStage = (props: MapStageProps): JSX.Element => {
  const { children, mapData } = props;
  const { layers, pixelSize } = mapData;
  const classes = useStyles();
  const [containerRef, { containerWidth, containerHeight }] = useHTMLElement(
    { containerWidth: 0, containerHeight: 0 },
    React.useCallback(
      (element: HTMLDivElement) => ({
        containerWidth: element.offsetWidth,
        containerHeight: element.offsetHeight,
      }),
      []
    )
  );

  const lastCenter = React.useRef<Vector2d | null>(null);
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

  const stageScaleWidth = containerWidth / mapWidth;
  const stageScaleHeight = containerHeight / mapHeight;
  const stageScale =
    stageScaleWidth < stageScaleHeight ? stageScaleWidth : stageScaleHeight;

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
      stage.batchDraw();
    },
    [stageScale]
  );

  const handleScroll = React.useCallback(
    (event: KonvaEventObject<WheelEvent>) => {
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
    [scaleStage]
  );

  const handleTouchMove = React.useCallback(
    (event: KonvaEventObject<TouchEvent>) => {
      event.evt.preventDefault();
      const { currentTarget: stage } = event;

      if (!(stage instanceof Konva.Stage)) {
        return;
      }

      if (event.evt.touches.length !== 2) {
        return;
      }

      if (stage.isDragging()) {
        stage.stopDrag();
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
    [scaleStage]
  );

  const handleTouchEnd = React.useCallback(() => {
    lastCenter.current = null;
    lastDist.current = 0;
  }, []);

  return (
    <div ref={containerRef} className={classes.container}>
      <Stage
        onWheel={handleScroll}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        width={containerWidth}
        height={containerHeight}
        scaleX={stageScale}
        scaleY={stageScale}
        offsetX={(minX - MapPadding) * pixelSize}
        offsetY={(minY - MapPadding) * pixelSize}
        draggable
      >
        {children}
      </Stage>
    </div>
  );
};

export default MapStage;
