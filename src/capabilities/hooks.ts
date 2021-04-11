import { AxiosPromise } from 'axios';
import { ResponseValues } from 'axios-hooks';
import React from 'react';
import { useValetudo, Capability } from '../api';
import { useCapabilitySupported } from './CapabilitiesProvider';

type BasicControlActions = 'start' | 'stop' | 'pause' | 'home';
export const useBasicControlCapability = (): [
  boolean,
  ResponseValues<void, unknown>,
  (action: BasicControlActions) => AxiosPromise<void>,
  () => void
] => {
  const isSupported = useCapabilitySupported(Capability.BasicControl);
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

  return [isSupported, response, action, cancel];
};
