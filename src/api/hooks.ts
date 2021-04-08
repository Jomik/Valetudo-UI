import axios from 'axios';
import { makeUseAxios, UseAxiosResult } from 'axios-hooks';
import { MapData } from './MapData';
import { Capability } from './Capability';

const useValetudo = makeUseAxios({
  axios: axios.create({
    baseURL:
      process.env.NODE_ENV === 'development' ? 'http://localhost/' : undefined,
  }),
  cache: false,
});

export const useCapabilitiesRequest = (): UseAxiosResult<
  Capability[],
  unknown
> => {
  return useValetudo('api/v2/robot/capabilities');
};

export const useLatestMap = (): UseAxiosResult<MapData, unknown> => {
  return useValetudo('api/v2/robot/state/map');
};
