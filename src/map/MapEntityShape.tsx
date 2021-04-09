import { useTheme } from '@material-ui/core/styles';
import { LineConfig } from 'konva/types/shapes/Line';
import { Image, Line } from 'react-konva';
import { MapEntity, MapEntityType } from '../api';
import robotSrc from '../assets/icons/robot.svg';
import chargerSrc from '../assets/icons/charger.svg';
import markerSrc from '../assets/icons/marker_active.svg';

const robotImage = new window.Image();
robotImage.src = robotSrc;

const chargerImage = new window.Image();
chargerImage.src = chargerSrc;

const markerImage = new window.Image();
markerImage.src = markerSrc;

export interface MapEntityShapeProps {
  entity: MapEntity;
  pixelSize: number;
}

const MapEntityShape = (props: MapEntityShapeProps): JSX.Element | null => {
  const { entity, pixelSize } = props;
  const theme = useTheme();

  if (entity.type === MapEntityType.RobotPosition) {
    return (
      <Image
        image={robotImage}
        x={entity.points[0]}
        y={entity.points[1]}
        offsetX={robotImage.width / 2}
        offsetY={robotImage.height / 2}
        minimumScale={1}
      />
    );
  }
  if (entity.type === MapEntityType.ChargerLocation) {
    return (
      <Image
        image={chargerImage}
        x={entity.points[0]}
        y={entity.points[1]}
        offsetX={chargerImage.width / 2}
        offsetY={chargerImage.height / 2}
        minimumScale={1}
      />
    );
  }
  if (entity.type === MapEntityType.GoToTarget) {
    return (
      <Image
        image={markerImage}
        x={entity.points[0]}
        y={entity.points[1]}
        offsetX={markerImage.width / 2}
        offsetY={markerImage.height / 2}
        minimumScale={1}
      />
    );
  }

  const commonProps: LineConfig = {
    points: entity.points,
    strokeWidth: pixelSize,
    lineCap: 'round',
    lineJoin: 'round',
  };

  switch (entity.type) {
    case MapEntityType.Path:
      return <Line {...commonProps} stroke={theme.map.path} />;
    case MapEntityType.PredictedPath:
      return (
        <Line
          {...commonProps}
          stroke={theme.map.path}
          dash={[pixelSize * 5, pixelSize * 2]}
        />
      );
    case MapEntityType.VirtualWall:
      return <Line {...commonProps} {...theme.map.noGo} />;
    case MapEntityType.NoGoArea:
      return <Line {...commonProps} {...theme.map.noGo} closed />;
    case MapEntityType.NoMopArea:
      return <Line {...commonProps} {...theme.map.noMop} closed />;
    case MapEntityType.ActiveZone:
      return <Line {...commonProps} {...theme.map.active} closed />;
    default:
      return null;
  }
};

export default MapEntityShape;
