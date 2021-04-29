/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Capability } from './Capability';
import {
  BasicControlCommands,
  cleanZonePresets,
  fetchCapabilities,
  fetchIntensityPresets,
  fetchMap,
  fetchStateAttributes,
  fetchZonePresets,
  sendBasicControlCommand,
  sendGoToCommand,
  subscribeToMap,
  subscribeToStateAttributes,
  updateIntensity,
} from './client';
import { IntensityState } from './RawRobotState';
import { RobotState } from './RobotState';

enum CacheKey {
  Capabilities = 'capabilities',
  RobotMap = 'map',
  RobotState = 'state',
  IntensityPresets = 'intensity_presets',
  ZonePresets = 'zone_presets',
}
const useSSECacheUpdater = <T>(
  key: CacheKey,
  subscriber: (listener: (data: T) => void) => () => void
): void => {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    return subscriber((data) => queryClient.setQueryData(key, data));
  }, [key, queryClient, subscriber]);
};

export const useCapabilities = () =>
  useQuery(CacheKey.Capabilities, fetchCapabilities, { staleTime: Infinity });

export const useRobotMap = () => {
  useSSECacheUpdater(CacheKey.RobotMap, subscribeToMap);
  return useQuery(CacheKey.RobotMap, fetchMap, {
    staleTime: 1000,
  });
};

export const useRobotState = <T = RobotState>(
  select?: (data: RobotState) => T
) => {
  useSSECacheUpdater(CacheKey.RobotState, subscribeToStateAttributes);
  return useQuery(CacheKey.RobotState, fetchStateAttributes, {
    staleTime: 1000,
    select,
  });
};

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
      sendBasicControlCommand(command).then(fetchStateAttributes),
    {
      onSuccess(data) {
        queryClient.setQueryData(CacheKey.RobotState, data);
      },
    }
  );
};

export const useGoToMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (coordinates: { x: number; y: number }) =>
      sendGoToCommand(coordinates).then(fetchStateAttributes),
    {
      onSuccess(data) {
        queryClient.setQueryData(CacheKey.RobotState, data);
      },
    }
  );
};

export const useZonePresets = () =>
  useQuery(CacheKey.ZonePresets, fetchZonePresets, { staleTime: Infinity });

export const useCleanZonePresetsMutation = () =>
  useMutation((ids: string[]) => cleanZonePresets(ids));
