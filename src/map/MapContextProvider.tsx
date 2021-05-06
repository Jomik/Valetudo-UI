import { Vector2d } from 'konva/types/types';
import React from 'react';
import { Capability, RawMapLayer } from '../api';
import { useCapabilitiesSupported } from '../CapabilitiesProvider';

type Layer = 'go' | 'segments' | 'zones';
export interface MapContext {
  layers: Array<Layer>;
  selectedLayer: Layer | undefined;
  goToPoint: Vector2d | undefined;
  selectedSegments: string[];
  onMapInteraction(layer: RawMapLayer, position: Vector2d): void;
  onSelectLayer(layer: Layer): void;
  onClear(): void;
}

const Context = React.createContext<MapContext | undefined>(undefined);

export const useMapContext = (): MapContext => {
  const context = React.useContext(Context);

  if (context === undefined) {
    throw new Error('Missing MapContextProvider');
  }

  return context;
};

const MapContextProvider = (props: {
  children: React.ReactNode;
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
    MapContext['selectedLayer']
  >();
  const [goToPoint, setGoToPoint] = React.useState<MapContext['goToPoint']>();
  const [selectedSegments, setSelectedSegments] = React.useState<
    MapContext['selectedSegments']
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
    MapContext['onMapInteraction']
  >(
    (layer, position) => {
      switch (selectedLayer) {
        case 'go': {
          setGoToPoint((prev) =>
            prev !== undefined && prev.x === position.x && prev.y === position.y
              ? undefined
              : position
          );
          break;
        }
        case 'segments': {
          const id = layer.metaData.segmentId;
          if (layer.type !== 'segment' || id === undefined) {
            return;
          }
          setSelectedSegments((prev) => {
            if (prev.includes(id)) {
              return prev.filter((v) => v !== id);
            }

            return [...prev, id];
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

  const handleSelectLayer = React.useCallback<MapContext['onSelectLayer']>(
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

export default MapContextProvider;
