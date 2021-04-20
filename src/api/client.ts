import axios from 'axios';
import { RawMapData } from './RawMapData';
import { Capability } from './Capability';
import {
  IntensityState,
  RobotAttribute,
  RobotAttributeClass,
} from './RawRobotState';
import { RobotState } from './RobotState';
import { getAttributes } from './utils';

export const valetudoAPI = axios.create({
  baseURL: `/api/v2`,
});

const SSETracker = new Map<string, () => () => void>();
const subscribeToSSE = <T>(
  endpoint: string,
  event: string,
  listener: (data: T) => void
): (() => void) => {
  const key = `${endpoint}@${event}`;
  const tracker = SSETracker.get(key);
  if (tracker !== undefined) {
    return tracker();
  }

  const source = new EventSource(valetudoAPI.defaults.baseURL + endpoint, {
    withCredentials: true,
  });

  source.addEventListener(event, (event: any) => {
    const data = JSON.parse(event.data);
    listener(data);
  });
  console.log(`[SSE] Subscribed to ${endpoint} ${event}`);

  let subscribers = 0;
  const subscriber = () => {
    subscribers += 1;
    return () => {
      subscribers -= 1;
      if (subscribers <= 0) {
        source.close();
      }
    };
  };

  SSETracker.set(key, subscriber);

  return subscriber();
};

export const fetchCapabilities = (): Promise<Capability[]> =>
  valetudoAPI.get<Capability[]>('/robot/capabilities').then(({ data }) => data);

export const fetchMap = (): Promise<RawMapData> =>
  valetudoAPI.get<RawMapData>('/robot/state/map').then(({ data }) => data);
export const subscribeToMap = (
  listener: (data: RawMapData) => void
): (() => void) =>
  subscribeToSSE('/robot/state/map/sse', 'MapUpdated', listener);

const attributesToState = (attributes: RobotAttribute[]): RobotState => {
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
    (prev, { type, value, customValue }) => {
      if (type === 'fan_speed') {
        return {
          ...prev,
          [Capability.FanSpeedControl]: { level: value, customValue },
        };
      }
      if (type === 'water_grade') {
        return {
          ...prev,
          [Capability.WaterUsageControl]: { level: value, customValue },
        };
      }
      return prev;
    },
    {}
  );

  return {
    status: {
      state: statusAttribute.value,
      flag: statusAttribute.flag,
    },
    battery: {
      status: batteryAttribute.flag,
      level: batteryAttribute.level,
    },
    intensity,
  };
};

export const fetchStateAttributes = async (): Promise<RobotState> =>
  valetudoAPI
    .get<RobotAttribute[]>('/robot/state/attributes')
    .then(({ data }) => attributesToState(data));
export const subscribeToStateAttributes = (
  listener: (data: RobotState) => void
): (() => void) =>
  subscribeToSSE<RobotAttribute[]>(
    '/robot/state/attributes/sse',
    'StateAttributesUpdated',
    (data) => listener(attributesToState(data))
  );

export const fetchIntensityPresets = async (
  capability: Capability.FanSpeedControl | Capability.WaterUsageControl
): Promise<IntensityState['value'][]> =>
  valetudoAPI
    .get<IntensityState['value'][]>(`/robot/capabilities/${capability}/presets`)
    .then(({ data }) => data);

export const updateIntensity = async (
  capability: Capability.FanSpeedControl | Capability.WaterUsageControl,
  level: IntensityState['value']
): Promise<void> => {
  await valetudoAPI.put<void>(`/robot/capabilities/${capability}/preset`, {
    name: level,
  });
};

export type BasicControlCommands = 'start' | 'stop' | 'pause' | 'home';
export const sendBasicControlCommand = async (
  command: BasicControlCommands
): Promise<void> => {
  await valetudoAPI.put<void>(
    `/robot/capabilities/${Capability.BasicControl}`,
    {
      action: command,
    }
  );
};
