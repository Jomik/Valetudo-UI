/* eslint-disable @typescript-eslint/no-var-requires */
import { createServer, Response } from 'miragejs';
import { Capability, RawRobotState, ZonePreset } from '../api';

export const makeServer = (environment: 'test' | 'development'): void => {
  const state: RawRobotState = require('./state.json');
  const zonePresets: Record<
    string,
    ZonePreset
  > = require('./zone_presets.json');

  createServer({
    environment,
    namespace: '/api/v2',
    timing: 1200,
    routes() {
      this.get('/robot/state', () => state);
      this.get('/robot/state/attributes', () => state.attributes);
      this.get('/robot/state/map', () => state.map);
      this.get('/robot/capabilities', () => [
        Capability.BasicControl,
        Capability.FanSpeedControl,
        Capability.WaterUsageControl,
        Capability.ZoneCleaning,
      ]);
      this.put(
        `/robot/capabilities/${Capability.BasicControl}`,
        () => new Response(200)
      );
      this.get(
        `/robot/capabilities/${Capability.FanSpeedControl}/presets`,
        () => ['low', 'medium', 'high', 'turbo', 'off']
      );
      this.put(
        `/robot/capabilities/${Capability.FanSpeedControl}/preset`,
        () => new Response(200)
      );
      this.get(
        `/robot/capabilities/${Capability.WaterUsageControl}/presets`,
        () => ['low', 'medium', 'high', 'off']
      );
      this.put(
        `/robot/capabilities/${Capability.WaterUsageControl}/preset`,
        () => new Response(200)
      );
      this.get(
        `/robot/capabilities/${Capability.ZoneCleaning}/presets`,
        () => zonePresets
      );
    },
  });
};
