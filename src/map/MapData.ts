export interface MapData {
  metaData: MapDataMetaData;
  size: {
    x: number;
    y: number;
  };
  pixelSize: number;
  layers: MapLayer[];
  entities: MapEntity[];
}

export interface MapEntity {
  metaData: MapEntityMetaData;
  points: number[];
  type: MapEntityType;
}

export interface MapEntityMetaData {
  angle?: number;
}

export interface MapLayer {
  metaData: MapLayerMetaData;
  type: MapLayerType;
  pixels: number[];
  dimensions: {
    x: MapLayerDimension;
    y: MapLayerDimension;
  };
}

export interface MapLayerDimension {
  min: number;
  max: number;
  mid: number;
}

export interface MapLayerMetaData {
  area: number;
  segmentId?: string;
  active?: boolean;
}

export enum MapLayerType {
  Floor = 'floor',
  Segment = 'segment',
  Wall = 'wall',
}

export enum MapEntityType {
  ChargerLocation = 'charger_location',
  RobotPosition = 'robot_position',
  GoToTarget = 'go_to_target',
  Path = 'path',
  PredictedPath = 'predicted_path',
  VirtualWall = 'virtual_wall',
  NoGoArea = 'no_go_area',
  NoMopArea = 'no_mop_area',
  ActiveZone = 'active_zone',
}

export interface MapDataMetaData {
  version: number;
}
