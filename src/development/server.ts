/* eslint-disable @typescript-eslint/no-var-requires */
import { createServer, Response } from 'miragejs';
import { Capability } from '../api';

import map from '../mocks/map/FW2020_with_segments_cleaning.json';
import state from '../mocks/state.json';

export const makeServer = (environment: 'test' | 'development'): void => {
  createServer({
    environment,
    namespace: '/api/v2',
    routes() {
      this.get('/robot/state/map', () => map);
      this.get('/robot/state', () => state);
      this.get('/robot/capabilities', () => [
        Capability.BasicControl,
        Capability.FanSpeedControl,
        Capability.WaterUsageControl,
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
    },
  });
};
