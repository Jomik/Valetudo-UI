/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Capability } from './Capability';
import {
  BasicControlCommands,
  cleanSegments,
  cleanZonePresets,
  fetchCapabilities,
  fetchGoToLocationPresets,
  fetchPresetSelections,
  fetchMap,
  fetchSegments,
  fetchStateAttributes,
  fetchZonePresets,
  goToLocationPreset,
  sendBasicControlCommand,
  sendGoToCommand,
  subscribeToMap,
  subscribeToStateAttributes,
  updatePresetSelection,
} from './client';
import { PresetSelectionState } from './RawRobotState';
import { RobotState } from './RobotState';

enum CacheKey {
  Capabilities = 'capabilities',
  RobotMap = 'map',
  RobotState = 'state',
  PresetSelections = 'preset_selections',
  ZonePresets = 'zone_presets',
  Segments = 'segments',
  GoToLocationPresets = 'go_to_location_presets',
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

export const usePreseSelections = (
  capability: Capability.FanSpeedControl | Capability.WaterUsageControl
) =>
  useQuery(
    [CacheKey.PresetSelections, capability],
    () => fetchPresetSelections(capability),
    {
      staleTime: Infinity,
    }
  );

export const usePresetSelectionMutation = (
  capability: Capability.FanSpeedControl | Capability.WaterUsageControl
) => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    unknown,
    PresetSelectionState['value'],
    { previousState: RobotState } | undefined
  >((level) => updatePresetSelection(capability, level), {
    async onMutate(level) {
      await queryClient.cancelQueries(CacheKey.RobotState);

      const state = queryClient.getQueryData<RobotState>(CacheKey.RobotState);
      if (state === undefined) {
        return;
      }

      queryClient.setQueryData<RobotState>(CacheKey.RobotState, {
        ...state,
        presets: {
          ...state.presets,
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

export const useCleanZonePresetsMutation = () => useMutation(cleanZonePresets);

export const useSegments = () =>
  useQuery(CacheKey.Segments, fetchSegments, { staleTime: Infinity });

export const useCleanSegmentsMutation = () => useMutation(cleanSegments);

export const useGoToLocationPresets = () =>
  useQuery(CacheKey.GoToLocationPresets, fetchGoToLocationPresets, {
    staleTime: Infinity,
  });

export const useGoToLocationPresetMutation = () =>
  useMutation(goToLocationPreset);
