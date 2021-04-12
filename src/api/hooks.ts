import axios, { AxiosPromise } from 'axios';
import { makeUseAxios, ResponseValues, UseAxiosResult } from 'axios-hooks';
import React from 'react';
import { Capability } from './Capability';
import { MapData } from './MapData';

export const useValetudo = makeUseAxios({
  axios: axios.create(),
});

export const useLatestMap = (): UseAxiosResult<MapData, unknown> => {
  return useValetudo('api/v2/robot/state/map', { useCache: false });
};

export type BasicControlActions = 'start' | 'pause' | 'stop' | 'home';
export const useBasicControl = (): [
  ResponseValues<void, unknown>,
  (action: BasicControlActions) => AxiosPromise<void>,
  () => void
] => {
  const [response, execute, cancel] = useValetudo<void, unknown>(
    {
      url: `api/v2/robot/capabilities/${Capability.BasicControl}`,
      method: 'PUT',
    },
    { manual: true }
  );

  const action = React.useCallback(
    (action: BasicControlActions) => execute({ data: { action } }),
    [execute]
  );

  return [response, action, cancel];
};
