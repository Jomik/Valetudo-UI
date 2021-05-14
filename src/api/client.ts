import axios from 'axios';
import { RawMapData } from './RawMapData';
import { Capability } from './Capability';
import { PresetSelectionState, RobotAttribute } from './RawRobotState';
import { Zone, ZonePreset, ZoneProperties } from './Zone';
import { Segment } from './Segment';
import { GoToLocation } from './GoToLocation';

export type Coordinates = {
  x: number;
  y: number;
};
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

export const fetchStateAttributes = async (): Promise<RobotAttribute[]> =>
  valetudoAPI
    .get<RobotAttribute[]>('/robot/state/attributes')
    .then(({ data }) => data);
export const subscribeToStateAttributes = (
  listener: (data: RobotAttribute[]) => void
): (() => void) =>
  subscribeToSSE<RobotAttribute[]>(
    '/robot/state/attributes/sse',
    'StateAttributesUpdated',
    (data) => listener(data)
  );

export const fetchPresetSelections = async (
  capability: Capability.FanSpeedControl | Capability.WaterUsageControl
): Promise<PresetSelectionState['value'][]> =>
  valetudoAPI
    .get<PresetSelectionState['value'][]>(
      `/robot/capabilities/${capability}/presets`
    )
    .then(({ data }) => data);

export const updatePresetSelection = async (
  capability: Capability.FanSpeedControl | Capability.WaterUsageControl,
  level: PresetSelectionState['value']
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

export const sendGoToCommand = async ({ x, y }: Coordinates): Promise<void> => {
  await valetudoAPI.put<void>(
    `/robot/capabilities/${Capability.GoToLocation}`,
    {
      action: 'goto',
      coordinates: {
        x: Math.round(x),
        y: Math.round(y),
      },
    }
  );
};

export const fetchZonePresets = async (): Promise<ZonePreset[]> =>
  valetudoAPI
    .get<Record<string, ZonePreset>>(
      `/robot/capabilities/${Capability.ZoneCleaning}/presets`
    )
    .then(({ data }) => Object.values(data));

export const fetchZoneProperties = async (): Promise<ZoneProperties> =>
  valetudoAPI
    .get<ZoneProperties>(
      `/robot/capabilities/${Capability.ZoneCleaning}/properties`
    )
    .then(({ data }) => data);

export const cleanZonePreset = async (id: string): Promise<void> => {
  await valetudoAPI.put<void>(
    `/robot/capabilities/${Capability.ZoneCleaning}/presets/${id}`,
    {
      action: 'clean',
    }
  );
};

export const cleanTemporaryZones = async (zones: Zone[]): Promise<void> => {
  await valetudoAPI.put<void>(
    `/robot/capabilities/${Capability.ZoneCleaning}`,
    {
      action: 'clean',
      zones,
    }
  );
};

export const fetchSegments = async (): Promise<Segment[]> =>
  valetudoAPI
    .get<Segment[]>(`/robot/capabilities/${Capability.MapSegmentation}`)
    .then(({ data }) => data);

export const cleanSegments = async (ids: string[]): Promise<void> => {
  await valetudoAPI.put<void>(
    `/robot/capabilities/${Capability.MapSegmentation}`,
    {
      action: 'start_segment_action',
      segment_ids: ids,
    }
  );
};

export const fetchGoToLocationPresets = async (): Promise<Segment[]> =>
  valetudoAPI
    .get<Record<string, GoToLocation>>(
      `/robot/capabilities/${Capability.GoToLocation}/presets`
    )
    .then(({ data }) => Object.values(data));

export const goToLocationPreset = async (id: string): Promise<void> => {
  await valetudoAPI.put<void>(
    `/robot/capabilities/${Capability.GoToLocation}/presets/${id}`,
    {
      action: 'goto',
    }
  );
};
