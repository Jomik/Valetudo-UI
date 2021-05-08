import React from 'react';
import { Capability, Coordinates } from '../../api';
import { useCapabilitiesSupported } from '../../CapabilitiesProvider';
import { manhatten } from '../utils';

type Layer = 'go' | 'segments' | 'zones';
export interface RobotMapLayerContext {
  layers: Array<Layer>;
  selectedLayer: Layer | undefined;
  goToPoint: Coordinates | undefined;
  selectedSegments: string[];
  onMapInteraction(position: Coordinates, segmentId: string | undefined): void;
  onSelectLayer(layer: Layer): void;
  onClear(): void;
}

const Context = React.createContext<RobotMapLayerContext | undefined>(
  undefined
);

export const useRobotMapLayerContext = (): RobotMapLayerContext => {
  const context = React.useContext(Context);

  if (context === undefined) {
    throw new Error('Missing MapContextProvider');
  }

  return context;
};

const RobotMapLayersProvider = (props: {
  children: JSX.Element;
}): JSX.Element => {
  const { children } = props;
  const [
    goToLocation,
    mapSegmentation,
    zoneCleaning,
  ] = useCapabilitiesSupported(
    Capability.GoToLocation,
    Capability.MapSegmentation,
    Capability.ZoneCleaning
  );
  const [selectedLayer, setSelectedLayer] = React.useState<
    RobotMapLayerContext['selectedLayer']
  >();
  const [goToPoint, setGoToPoint] = React.useState<
    RobotMapLayerContext['goToPoint']
  >();
  const [selectedSegments, setSelectedSegments] = React.useState<
    RobotMapLayerContext['selectedSegments']
  >([]);

  const layers = React.useMemo(
    () =>
      ([
        goToLocation ? 'go' : undefined,
        mapSegmentation ? 'segments' : undefined,
        zoneCleaning ? 'zones' : undefined,
      ] as const).filter(
        <T,>(value: T | undefined): value is T => value !== undefined
      ),
    [goToLocation, mapSegmentation, zoneCleaning]
  );

  const handleMapInteraction = React.useCallback<
    RobotMapLayerContext['onMapInteraction']
  >(
    (position, segmentId) => {
      switch (selectedLayer) {
        case 'go': {
          setGoToPoint((prev) =>
            prev !== undefined &&
            manhatten([prev.x, prev.y], [position.x, position.y]) < 30
              ? undefined
              : position
          );
          break;
        }
        case 'segments': {
          if (segmentId === undefined) {
            return;
          }

          setSelectedSegments((prev) => {
            if (prev.includes(segmentId)) {
              return prev.filter((v) => v !== segmentId);
            }

            return [...prev, segmentId];
          });
        }
      }
    },
    [selectedLayer]
  );

  React.useEffect(() => {
    setSelectedLayer((prev) => (prev === undefined ? layers[0] : undefined));
  }, [layers]);

  const handleClear = React.useCallback(() => {
    setGoToPoint(undefined);
    setSelectedSegments([]);
  }, []);

  const handleSelectLayer = React.useCallback<
    RobotMapLayerContext['onSelectLayer']
  >(
    (layer) => {
      setSelectedLayer(layer);
      handleClear();
    },
    [handleClear]
  );

  return (
    <Context.Provider
      value={{
        onMapInteraction: handleMapInteraction,
        onSelectLayer: handleSelectLayer,
        onClear: handleClear,
        selectedLayer,
        layers,
        goToPoint,
        selectedSegments,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default RobotMapLayersProvider;
