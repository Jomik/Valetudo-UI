import axios from 'axios';
import { RawMapData } from './RawMapData';
import { Capability } from './Capability';
import {
  IntensityState,
  RawRobotState,
  RobotAttributeClass,
} from './RawRobotState';
import { RobotState } from './RobotState';
import { getAttributes } from './utils';

export const valetudoAPI = axios.create({
  baseURL: `/api/v2`,
});

export const fetchCapabilities = (): Promise<Capability[]> =>
  valetudoAPI.get<Capability[]>('/robot/capabilities').then(({ data }) => data);

export const fetchMap = (): Promise<RawMapData> =>
  valetudoAPI.get<RawMapData>('/robot/state/map').then(({ data }) => data);

export const fetchState = async (): Promise<RobotState> => {
  const { data } = await valetudoAPI.get<RawRobotState>('/robot/state');
  const { attributes } = data;

  const statusAttribute = getAttributes(
    RobotAttributeClass.StatusState,
    attributes
  )[0];

  const batteryAttribute = getAttributes(
    RobotAttributeClass.BatteryState,
    attributes
  )[0];

  const intensityAttributes = getAttributes(
    RobotAttributeClass.IntensityState,
    attributes
  );

  const intensity = intensityAttributes.reduce<RobotState['intensity']>(
    (prev, { type, value, customValue }) => ({
      ...prev,
      [type]: { level: value, customValue },
    }),
    {}
  );

  return {
    status: statusAttribute.value,
    battery: {
      status: batteryAttribute.value,
      level: batteryAttribute.level,
    },
    intensity,
  };
};

export const fetchFanSpeedPresets = async (): Promise<
  IntensityState['value'][]
> =>
  valetudoAPI
    .get<IntensityState['value'][]>(
      `/robot/capabilities/${Capability.FanSpeedControl}/presets`
    )
    .then(({ data }) => data);

export const updateFanSpeed = async (
  level: IntensityState['value']
): Promise<void> => {
  await valetudoAPI.put<void>(
    `/robot/capabilities/${Capability.FanSpeedControl}/preset`,
    { name: level }
  );
};
