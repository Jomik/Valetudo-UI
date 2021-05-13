import Konva from 'konva';
import { KonvaEventObject, Node } from 'konva/types/Node';
import { Vector2d } from 'konva/types/types';
import React from 'react';
import { Stage, StageProps } from 'react-konva';
import { useHTMLElement } from '../hooks';
import {
  bound,
  getCenter,
  getDistance,
  isTouchEnabled,
  ZeroVector,
} from './utils';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() => ({
  container: {
    position: 'relative',
    height: '100%',
    width: '100%',
  },
  stage: {
    position: 'absolute',
  },
}));

export type MapStageProps = StageProps & {
  children: JSX.Element;
  width: number;
  padding?: number;
  height: number;
  offset?: never;
  scale?: never;
  scaleX?: never;
  scaleY?: never;
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

const ScaleBound = 10;

const MapStage = React.forwardRef<{ redraw(): void }, MapStageProps>(
  (props, ref): JSX.Element => {
    const {
      children,
      padding = 0,
      offsetX = 0,
      offsetY = 0,
      width,
      height,
      onWheel,
      onTouchMove,
      onTouchEnd,
      ...stageConfig
    } = props;
    const classes = useStyles();
    const lastCenter = React.useRef<Vector2d | null>(null);
    const lastDragCenter = React.useRef<Vector2d | null>(null);
    const lastDist = React.useRef<number>(0);

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
    const stageRef = React.useRef<Konva.Stage>(null);

    const stageScaleX = (containerWidth - padding * 2) / width;
    const stageScaleY = (containerHeight - padding * 2) / height;
    const stageScale = Math.min(stageScaleX, stageScaleY);

    React.useImperativeHandle(
      ref,
      () => ({
        redraw() {
          const stage = stageRef.current;
          if (stage === null) {
            return;
          }
          scalePersistentNodes(stage);
          stage.batchDraw();
        },
      }),
      []
    );

    // Update scale of nodes that should have a specific size
    React.useEffect(() => {
      const stage = stageRef.current;
      if (stage === null) {
        return;
      }
      stage.scale({ x: stageScale, y: stageScale });
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

    const dragBoundFunc = React.useMemo(
      () =>
        function (this: Konva.Node, pos: Vector2d): Vector2d {
          const scaledPadding = padding / stageScale;
          const scale = this.scaleX();

          const calculateBoundaries = (
            value: number,
            container: number,
            map: number
          ) =>
            bound(
              value,
              -(map * stageScale - scaledPadding) * (scale / stageScale),
              (Math.max(container, map * stageScale) - scaledPadding * 2) *
                (stageScale / scale)
            );

          return {
            x: calculateBoundaries(pos.x, containerWidth, width),
            y: calculateBoundaries(pos.y, containerHeight, height),
          };
        },
      [containerHeight, containerWidth, height, padding, stageScale, width]
    );

    const handleOneTouch = React.useCallback(
      (stage: Konva.Stage, touch: Vector2d) => {
        if (lastDragCenter.current === null) {
          lastDragCenter.current = touch;
          return;
        }

        stage.position(
          dragBoundFunc.bind(stage)({
            x: stage.x() + touch.x - lastDragCenter.current.x,
            y: stage.y() + touch.y - lastDragCenter.current.y,
          })
        );

        stage.batchDraw();

        lastDragCenter.current = touch;
      },
      [dragBoundFunc]
    );

    const handleTwoTouches = React.useCallback(
      (stage: Konva.Stage, touches: [Vector2d, Vector2d]) => {
        const [touch1, touch2] = touches;
        const newCenter = getCenter(touch1, touch2);
        const dist = getDistance(touch1, touch2);

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
          handleOneTouch(stage, p1);
        } else if (event.evt.touches.length === 2) {
          const [touch1, touch2] = event.evt.touches;
          const p1 = { x: touch1.clientX, y: touch1.clientY };
          const p2 = { x: touch2.clientX, y: touch2.clientY };
          handleTwoTouches(stage, [p1, p2]);
        }
      },
      [handleOneTouch, handleTwoTouches, onTouchMove]
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
          {...stageConfig}
          className={classes.stage}
          ref={stageRef}
          draggable={!isTouchEnabled}
          dragBoundFunc={dragBoundFunc}
          onWheel={handleScroll}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          width={containerWidth}
          height={containerHeight}
          scaleX={stageScale}
          scaleY={stageScale}
          offsetX={offsetX - padding / stageScale}
          offsetY={offsetY - padding / stageScale}
        >
          {children}
        </Stage>
      </div>
    );
  }
);

export default MapStage;
