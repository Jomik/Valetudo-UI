import { createServer, Response } from 'miragejs';
import { Capability } from './api';

import map from './map/mock/FW2020_with_segments_cleaning.json';

export const makeServer = (environment: 'test' | 'development'): void => {
  createServer({
    environment,
    namespace: '/api/v2',
    routes() {
      this.get('/robot/state/map', () => map);

      this.get('/robot/capabilities', () => [Capability.BasicControl]);
      this.put(
        `/robot/capabilities/${Capability.BasicControl}`,
        () => new Response(200)
      );
    },
  });
};
