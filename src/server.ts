/* eslint-disable @typescript-eslint/no-var-requires */
import { createServer, Response } from 'miragejs';
import { Capability } from './api';

import map from './mocks/map/FW2020_with_segments_cleaning.json';
import state from './mocks/state.json';

export const makeServer = (environment: 'test' | 'development'): void => {
  createServer({
    environment,
    namespace: '/api/v2',
    routes() {
      this.get('/robot/state/map', () => map);
      this.get('/robot/state', () => state);

      this.get('/robot/capabilities', () => [Capability.BasicControl]);
      this.put(
        `/robot/capabilities/${Capability.BasicControl}`,
        () => new Response(200)
      );
    },
  });
};
