/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Capability } from './Capability';
import {
  BasicControlCommands,
  fetchCapabilities,
  fetchIntensityPresets,
  fetchMap,
  fetchState,
  sendBasicControlCommand,
  updateIntensity,
  valetudoAPI,
} from './client';
import { IntensityState } from './RawRobotState';
import { RobotState } from './RobotState';

enum CacheKey {
  Capabilities = 'capabilities',
  RobotMap = 'map',
  RobotState = 'state',
  IntensityPresets = 'intensity_presets',
}

const SSETracker = new Map<CacheKey, () => () => void>();

const useSSECacheUpdater = (
  key: CacheKey,
  endpoint: string,
  event: string
): void => {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const tracker = SSETracker.get(key);
    if (tracker !== undefined) {
      return tracker();
    }

    const source = new EventSource(valetudoAPI.defaults.baseURL + endpoint, {
      withCredentials: true,
    });

    source.addEventListener(event, (event: any) => {
      const data = JSON.parse(event.data);
      queryClient.setQueryData(key, data);
    });
    console.log(
      `[SSE] Subscribed to ${CacheKey.RobotMap} ${endpoint} ${event}`
    );

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

    SSETracker.set(CacheKey.RobotMap, subscriber);

    return subscriber();
  }, [endpoint, event, key, queryClient]);
};

export const useCapabilities = () =>
  useQuery(CacheKey.Capabilities, fetchCapabilities, { staleTime: Infinity });

export const useRobotMap = () => {
  useSSECacheUpdater(CacheKey.RobotMap, '/robot/state/map/sse', 'MapUpdated');
  return useQuery(CacheKey.RobotMap, fetchMap, {
    staleTime: 1000,
  });
};

export const useRobotState = <T = RobotState>(
  select?: (data: RobotState) => T
) =>
  useQuery(CacheKey.RobotState, fetchState, {
    staleTime: 1000,
    refetchInterval: 1000,
    select,
  });

export const useIntensityPresets = (
  capability: Capability.FanSpeedControl | Capability.WaterUsageControl
) =>
  useQuery(
    [CacheKey.IntensityPresets, capability],
    () => fetchIntensityPresets(capability),
    {
      staleTime: Infinity,
    }
  );

export const useIntensityMutation = (
  capability: Capability.FanSpeedControl | Capability.WaterUsageControl
) => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    unknown,
    IntensityState['value'],
    { previousState: RobotState } | undefined
  >((level) => updateIntensity(capability, level), {
    async onMutate(level) {
      await queryClient.cancelQueries(CacheKey.RobotState);

      const state = queryClient.getQueryData<RobotState>(CacheKey.RobotState);
      if (state === undefined) {
        return;
      }

      queryClient.setQueryData<RobotState>(CacheKey.RobotState, {
        ...state,
        intensity: {
          ...state.intensity,
          [capability]: {
            level,
            customValue: undefined,
          },
        },
      });
      return { previousState: state };
    },
    onSettled() {
      queryClient.invalidateQueries(CacheKey.RobotState);
    },
    onError(_err, _variables, context) {
      if (context?.previousState === undefined) {
        return;
      }

      queryClient.setQueryData<RobotState>(
        CacheKey.RobotState,
        context.previousState
      );
    },
  });
};

export const useBasicControlMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (command: BasicControlCommands) =>
      sendBasicControlCommand(command).then(fetchState),
    {
      onSuccess(data) {
        queryClient.setQueryData(CacheKey.RobotState, data);
      },
    }
  );
};
