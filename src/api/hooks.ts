/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useQuery } from 'react-query';
import { fetchCapabilities, fetchMap, fetchState } from './client';

enum CacheKey {
  Capabilities = 'capabilities',
  RobotMap = 'map',
  RobotState = 'state',
}

export const useCapabilities = () =>
  useQuery(CacheKey.Capabilities, fetchCapabilities, { staleTime: Infinity });

// TODO: Add SSE
export const useRobotMap = () =>
  useQuery(CacheKey.RobotMap, fetchMap, { staleTime: 1000 });

// TODO: Add refetchInterval or SSE
export const useRobotState = () =>
  useQuery(CacheKey.RobotState, fetchState, {
    staleTime: 1000,
  });
