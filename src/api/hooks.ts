import axios from 'axios';
import { makeUseAxios, UseAxiosResult } from 'axios-hooks';
import { MapData } from './MapData';

export const useValetudo = makeUseAxios({
  axios: axios.create({
    baseURL:
      process.env.NODE_ENV === 'development' ? 'http://localhost/' : undefined,
  }),
});

export const useLatestMap = (): UseAxiosResult<MapData, unknown> => {
  return useValetudo('api/v2/robot/state/map', { useCache: false });
};
