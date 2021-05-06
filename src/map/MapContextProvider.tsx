import { Vector2d } from 'konva/types/types';
import React from 'react';
import { Capability, RawMapLayer } from '../api';
import { useCapabilitiesSupported } from '../CapabilitiesProvider';

type Layer = 'go' | 'segments' | 'zones';
export interface MapContext {
  layers: Array<Layer>;
  selectedLayer?: Layer;
  goToPoint?: Vector2d;
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
  const [selectedLayer, setSelectedLayer] = React.useState<Layer>();
  const [goToPoint, setGoToPoint] = React.useState<Vector2d>();

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
      if (selectedLayer === 'go') {
        setGoToPoint((prev) =>
          prev !== undefined && prev.x === position.x && prev.y === position.y
            ? undefined
            : position
        );
        return;
      }
    },
    [selectedLayer]
  );

  React.useEffect(() => {
    setSelectedLayer((prev) => (prev === undefined ? layers[0] : undefined));
  }, [layers]);

  const handleClear = React.useCallback(() => {
    setGoToPoint(undefined);
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
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default MapContextProvider;
