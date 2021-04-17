import { useTheme } from '@material-ui/core';
import { LineConfig } from 'konva/types/shapes/Line';
import { Image, Line } from 'react-konva';
import { RawMapEntity, RawMapEntityType } from '../api';
import robotSrc from '../assets/icons/robot.svg';
import chargerSrc from '../assets/icons/charger.svg';
import markerSrc from '../assets/icons/marker_active.svg';
import { ImageConfig } from 'konva/types/shapes/Image';

const robotImage = new window.Image();
robotImage.src = robotSrc;

const chargerImage = new window.Image();
chargerImage.src = chargerSrc;

const markerImage = new window.Image();
markerImage.src = markerSrc;

export interface MapEntityShapeProps {
  entity: RawMapEntity;
  pixelSize: number;
}

const MapEntityShape = (props: MapEntityShapeProps): JSX.Element | null => {
  const { entity, pixelSize } = props;
  const theme = useTheme();

  const commonImageProps = (image: HTMLImageElement): ImageConfig => ({
    image: image,
    x: entity.points[0],
    y: entity.points[1],
    offsetX: image.width / 2,
    offsetY: image.height / 2,
    minimumScale: 1,
    rotation: entity.metaData.angle,
  });

  const commonLineProps: LineConfig = {
    points: entity.points,
    strokeWidth: pixelSize,
    lineCap: 'round',
    lineJoin: 'round',
  };

  switch (entity.type) {
    case RawMapEntityType.RobotPosition:
      return <Image {...commonImageProps(robotImage)} />;
    case RawMapEntityType.ChargerLocation:
      return <Image {...commonImageProps(chargerImage)} />;
    case RawMapEntityType.GoToTarget:
      return <Image {...commonImageProps(chargerImage)} />;
    case RawMapEntityType.Path:
      return <Line {...commonLineProps} stroke={theme.map.path} />;
    case RawMapEntityType.PredictedPath:
      return (
        <Line
          {...commonLineProps}
          stroke={theme.map.path}
          dash={[pixelSize * 5, pixelSize * 2]}
        />
      );
    case RawMapEntityType.VirtualWall:
      return <Line {...commonLineProps} {...theme.map.noGo} />;
    case RawMapEntityType.NoGoArea:
      return <Line {...commonLineProps} {...theme.map.noGo} closed />;
    case RawMapEntityType.NoMopArea:
      return <Line {...commonLineProps} {...theme.map.noMop} closed />;
    case RawMapEntityType.ActiveZone:
      return <Line {...commonLineProps} {...theme.map.active} closed />;
    default:
      return null;
  }
};

export default MapEntityShape;
