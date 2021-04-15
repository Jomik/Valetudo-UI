/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  fetchCapabilities,
  fetchFanSpeedPresets,
  fetchMap,
  fetchState,
  updateFanSpeed,
} from './client';
import { IntensityState } from './RawRobotState';
import { RobotState } from './RobotState';

enum CacheKey {
  Capabilities = 'capabilities',
  RobotMap = 'map',
  RobotState = 'state',
  FanSpeedPresets = 'fan_speed_presets',
}

export const useCapabilities = () =>
  useQuery(CacheKey.Capabilities, fetchCapabilities, { staleTime: Infinity });

// TODO: Add SSE
export const useRobotMap = () =>
  useQuery(CacheKey.RobotMap, fetchMap, { staleTime: 1000 });

// TODO: Add refetchInterval or SSE
export const useRobotStateQuery = () =>
  useQuery(CacheKey.RobotState, fetchState, {
    staleTime: 1000,
  });

export const useFanSpeedPresets = () =>
  useQuery(CacheKey.FanSpeedPresets, fetchFanSpeedPresets, {
    staleTime: Infinity,
  });

export const useFanSpeedMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    unknown,
    IntensityState['value'],
    { previousState: RobotState } | undefined
  >(updateFanSpeed, {
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
          fan_speed: {
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
