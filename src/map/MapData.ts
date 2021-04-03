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
  Path = 'path',
  PredictedPath = 'predicted_path',
  ChargerLocation = 'charger_location',
  RobotPosition = 'robot_position',
  VirtualWall = 'virtual_wall',
  NoGoArea = 'no_go_area',
  NoMopArea = 'no_mop_area',
}

export interface MapDataMetaData {
  vendorMapId: number;
  version: number;
}

