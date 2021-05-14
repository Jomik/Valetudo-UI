/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from 'react-query';
import { Capability } from './Capability';
import {
  BasicControlCommands,
  cleanSegments,
  cleanZonePreset,
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
  Coordinates,
  fetchZoneProperties,
  cleanTemporaryZones,
} from './client';
import {
  PresetSelectionState,
  RobotAttribute,
  RobotAttributeClass,
  StatusState,
} from './RawRobotState';
import { isAttribute, replaceAttribute } from './utils';
import { Zone } from './Zone';

enum CacheKey {
  Capabilities = 'capabilities',
  Map = 'map',
  Attributes = 'attributes',
  PresetSelections = 'preset_selections',
  ZonePresets = 'zone_presets',
  ZoneProperties = 'zone_properties',
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
  useSSECacheUpdater(CacheKey.Map, subscribeToMap);
  return useQuery(CacheKey.Map, fetchMap, {
    staleTime: 1000,
  });
};

export function useRobotAttribute<C extends RobotAttributeClass>(
  clazz: C
): UseQueryResult<Extract<RobotAttribute, { __class: C }>[]>;
export function useRobotAttribute<C extends RobotAttributeClass, T>(
  clazz: C,
  select: (attributes: Extract<RobotAttribute, { __class: C }>[]) => T
): UseQueryResult<T>;
export function useRobotAttribute<C extends RobotAttributeClass>(
  clazz: C,
  select?: (attributes: Extract<RobotAttribute, { __class: C }>[]) => any
): UseQueryResult<any> {
  useSSECacheUpdater(CacheKey.Attributes, subscribeToStateAttributes);
  return useQuery(CacheKey.Attributes, fetchStateAttributes, {
    staleTime: 1000,
    select: (attributes) => {
      const filteredAttributes = attributes.filter(isAttribute(clazz));

      return select ? select(filteredAttributes) : filteredAttributes;
    },
  });
}

export function useRobotStatus(): UseQueryResult<StatusState>;
export function useRobotStatus<T>(
  select: (status: StatusState) => T
): UseQueryResult<T>;
export function useRobotStatus(select?: (status: StatusState) => any) {
  useSSECacheUpdater(CacheKey.Attributes, subscribeToStateAttributes);
  return useQuery(CacheKey.Attributes, fetchStateAttributes, {
    staleTime: 1000,
    select: (attributes) => {
      const status =
        attributes.filter(isAttribute(RobotAttributeClass.StatusState))[0] ??
        ({
          __class: RobotAttributeClass.StatusState,
          metaData: {},
          value: 'error',
          flag: 'none',
        } as StatusState);

      return select ? select(status) : status;
    },
  });
}

export const usePresetSelections = (
  capability: Capability.FanSpeedControl | Capability.WaterUsageControl
) =>
  useQuery(
    [CacheKey.PresetSelections, capability],
    () => fetchPresetSelections(capability),
    {
      staleTime: Infinity,
    }
  );

export const capabilityToPresetType: Record<
  Parameters<typeof usePresetSelectionMutation>[0],
  PresetSelectionState['type']
> = {
  [Capability.FanSpeedControl]: 'fan_speed',
  [Capability.WaterUsageControl]: 'water_grade',
};
export const usePresetSelectionMutation = (
  capability: Capability.FanSpeedControl | Capability.WaterUsageControl
) => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    unknown,
    PresetSelectionState['value'],
    { previousAttributes: RobotAttribute[] } | undefined
  >((level) => updatePresetSelection(capability, level), {
    async onMutate(level) {
      await queryClient.cancelQueries(CacheKey.Attributes);

      const attributes = queryClient.getQueryData<RobotAttribute[]>(
        CacheKey.Attributes
      );
      if (attributes === undefined) {
        return;
      }

      const type = capabilityToPresetType[capability];

      queryClient.setQueryData<RobotAttribute[]>(
        CacheKey.Attributes,
        replaceAttribute(
          RobotAttributeClass.PresetSelectionState,
          (attribute) => attribute.type === type,
          (attribute) => ({ ...attribute, level })
        )(attributes)
      );

      return { previousAttributes: attributes };
    },
    onSettled() {
      queryClient.invalidateQueries(CacheKey.Attributes);
    },
    onError(_err, _variables, context) {
      if (context?.previousAttributes === undefined) {
        return;
      }

      queryClient.setQueryData<RobotAttribute[]>(
        CacheKey.Attributes,
        context.previousAttributes
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
        queryClient.setQueryData<RobotAttribute[]>(CacheKey.Attributes, data, {
          updatedAt: Date.now(),
        });
      },
    }
  );
};

export const useGoToMutation = (
  options?: UseMutationOptions<RobotAttribute[], unknown, Coordinates>
) => {
  const queryClient = useQueryClient();

  return useMutation(
    (coordinates: { x: number; y: number }) =>
      sendGoToCommand(coordinates).then(fetchStateAttributes),
    {
      ...options,
      async onSuccess(data, ...args) {
        queryClient.setQueryData<RobotAttribute[]>(CacheKey.Attributes, data, {
          updatedAt: Date.now(),
        });
        await options?.onSuccess?.(data, ...args);
      },
    }
  );
};

export const useZonePresets = () =>
  useQuery(CacheKey.ZonePresets, fetchZonePresets, { staleTime: Infinity });

export const useZoneProperties = () =>
  useQuery(CacheKey.ZoneProperties, fetchZoneProperties, {
    staleTime: Infinity,
  });

export const useCleanZonePresetMutation = (
  options?: UseMutationOptions<RobotAttribute[], unknown, string>
) => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) => cleanZonePreset(id).then(fetchStateAttributes),
    {
      ...options,
      async onSuccess(data, ...args) {
        queryClient.setQueryData<RobotAttribute[]>(CacheKey.Attributes, data, {
          updatedAt: Date.now(),
        });
        await options?.onSuccess?.(data, ...args);
      },
    }
  );
};

export const useCleanTemporaryZonesMutation = (
  options?: UseMutationOptions<RobotAttribute[], unknown, Zone[]>
) => {
  const queryClient = useQueryClient();

  return useMutation(
    (zones: Zone[]) => cleanTemporaryZones(zones).then(fetchStateAttributes),
    {
      ...options,
      async onSuccess(data, ...args) {
        queryClient.setQueryData<RobotAttribute[]>(CacheKey.Attributes, data, {
          updatedAt: Date.now(),
        });
        await options?.onSuccess?.(data, ...args);
      },
    }
  );
};

export const useSegments = () =>
  useQuery(CacheKey.Segments, fetchSegments, { staleTime: Infinity });

export const useCleanSegmentsMutation = (
  options?: UseMutationOptions<RobotAttribute[], unknown, string[]>
) => {
  const queryClient = useQueryClient();

  return useMutation(
    (ids: string[]) => cleanSegments(ids).then(fetchStateAttributes),
    {
      ...options,
      async onSuccess(data, ...args) {
        queryClient.setQueryData<RobotAttribute[]>(CacheKey.Attributes, data, {
          updatedAt: Date.now(),
        });
        await options?.onSuccess?.(data, ...args);
      },
    }
  );
};

export const useGoToLocationPresets = () =>
  useQuery(CacheKey.GoToLocationPresets, fetchGoToLocationPresets, {
    staleTime: Infinity,
  });

export const useGoToLocationPresetMutation = (
  options?: UseMutationOptions<RobotAttribute[], unknown, string>
) => {
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) => goToLocationPreset(id).then(fetchStateAttributes),
    {
      ...options,
      async onSuccess(data, ...args) {
        queryClient.setQueryData<RobotAttribute[]>(CacheKey.Attributes, data, {
          updatedAt: Date.now(),
        });
        await options?.onSuccess?.(data, ...args);
      },
    }
  );
};
