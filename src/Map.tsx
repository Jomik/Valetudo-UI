import { Container } from '@material-ui/core';
import { Context } from 'konva/types/Context';
import { ShapeConfig, Shape as ShapeType } from 'konva/types/Shape';
import React  from 'react';
import { Layer, Rect, Shape, Stage } from 'react-konva';
import * as mapData from './mapdata.json';

const useElement = <E extends HTMLElement, T>(mapper:(element: E) => T): [
  React.MutableRefObject<E | null>,
  T | undefined
  ] => {
  const [value, setValue] = React.useState<T>();
  const nodeRef = React.useRef<E>(null);

  React.useLayoutEffect(() => {
    if (nodeRef.current) {
      let cancel = false;
      const update = () => {
        if (!cancel && nodeRef.current) {
          setValue(mapper(nodeRef.current));
        }
      };

      window.requestAnimationFrame(update);
      window.addEventListener('resize', update);

      return () => {
        window.addEventListener('resize', update);
        cancel = true;
      };
    }
  }, [mapper]);

  return [nodeRef, value];
};

const pairWise = function* <T>(arr: T[]) {
  for (let i = 0; i < arr.length; i = i + 2) {
    yield arr.slice(i, i + 2) as [T, T];
  }
};

type PixelsProps = {
  pixelSize: number;
  pixels: number[];
  type: string;
};

const typeToColorMap: Record<string, string | undefined> = {
  wall: '#000000',
  floor: '#FAFAFA',
  segment: '#00D2FA',
};

const Pixels = (props: PixelsProps): JSX.Element => {
  const { pixels, pixelSize, type } = props;

  const coordinates = React.useMemo(() => [...pairWise(pixels)], [pixels]);
  // const sceneFunc = React.useCallback<Required<ShapeConfig>['sceneFunc']>((context, shape) => {
  const sceneFunc = (context: Context, shape: ShapeType<ShapeConfig>) => {
    const width = shape.getAttr('width');
    const height = shape.getAttr('height');

    // For some reason, beginPath is the one that sets color.
    context.beginPath();
    context.closePath();

    coordinates.forEach(([x, y]) => {
      context.rect(x, y, width, height);
    });

    context.fillStrokeShape(shape);
  };

  return (
    <Shape 
      sceneFunc={sceneFunc}
      preventDefault={false}
      fill={typeToColorMap[type] ?? 'red'}
      width={pixelSize}
      height={pixelSize}
    />
  );
};

type MapProps = {
  mapData: typeof mapData;
};

const MapPadding = 10;
const Map = (props: MapProps): JSX.Element => {
  const { mapData } = props;
  const { layers, pixelSize } = mapData;
  const [containerRef, containerWidth = 0] = useElement(React.useCallback((element: HTMLDivElement) => element.offsetWidth, []));

  const minX = Math.min(...layers.map((layer) => layer.dimensions.x.min));
  const maxX = Math.max(...layers.map((layer) => layer.dimensions.x.max));
  const minY = Math.min(...layers.map((layer) => layer.dimensions.y.min));
  const maxY = Math.max(...layers.map((layer) => layer.dimensions.y.max));

  const stageWidth = (maxX - minX + MapPadding * 2) * pixelSize;
  const stageHeight = (maxY - minY + MapPadding * 2) * pixelSize;

  const scale = containerWidth / stageWidth;

  return (
    <Container ref={containerRef}>
      <Stage
        width={stageWidth * scale}
        height={stageHeight * scale}
        scaleX={scale}
        scaleY={scale}
        offsetX={(minX - MapPadding) * pixelSize}
        offsetY={(minY - MapPadding) * pixelSize}
        preventDefault={false}
      >
        <Layer>
          <Rect x={0} y={0} width={stageWidth * scale} height={stageHeight * scale} fill="green"/>
          {layers.map((layer) => (
            <Pixels
              pixels={layer.pixels.map((p) => p * pixelSize)}
              type={layer.type}
              pixelSize={pixelSize}
              key={`${layer.type}:${layer.metaData.segmentId}`}
            />
          ))}
        </Layer>
      </Stage>
    </Container>
  );
};

export default Map;
