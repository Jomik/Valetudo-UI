import { createStyles, makeStyles } from '@material-ui/core/styles';
import React from 'react';
import { Stage } from 'react-konva';
import { useHTMLElement } from '../hooks';
import { MapData } from './MapData';

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

const MapPadding = 10;
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
  // TODO: Remove this when Valetudo does not return empty layers.
  const filteredLayers = layers.filter((layer) => layer.metaData.area > 0);

  const minX = Math.min(
    ...filteredLayers.map((layer) => layer.dimensions.x.min)
  );
  const maxX = Math.max(
    ...filteredLayers.map((layer) => layer.dimensions.x.max)
  );
  const minY = Math.min(
    ...filteredLayers.map((layer) => layer.dimensions.y.min)
  );
  const maxY = Math.max(
    ...filteredLayers.map((layer) => layer.dimensions.y.max)
  );

  const stageWidth = (maxX - minX + MapPadding * 2) * pixelSize;
  const stageHeight = (maxY - minY + MapPadding * 2) * pixelSize;

  const stageScaleWidth = containerWidth / stageWidth;
  const stageScaleHeight = containerHeight / stageHeight;
  const stageScale =
    stageScaleWidth < stageScaleHeight ? stageScaleWidth : stageScaleHeight;

  return (
    <div ref={containerRef} className={classes.container}>
      <Stage
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
