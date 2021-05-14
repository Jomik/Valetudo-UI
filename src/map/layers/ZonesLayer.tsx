import {
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  Grid,
  makeStyles,
  Typography,
  Zoom,
} from '@material-ui/core';
import React from 'react';
import * as uuid from 'uuid';
import {
  Capability,
  RawMapEntityType,
  useCleanTemporaryZonesMutation,
  useRobotStatus,
  useZoneProperties,
} from '../../api';
import Map from '../Map';
import { LayerActionsContainer, LayerActionButton } from './Styled';
import { MapLayersProps } from './types';
import { useMapEntities, useMapLayers } from './hooks';
import { Rect, Transformer } from 'react-konva';
import Konva from 'konva';
import { inside } from '../utils';
import { useSnackbar } from 'notistack';

interface Zone {
  id: string;
  iterations: number;
  position: {
    x: number;
    y: number;
  };
  width: number;
  height: number;
}

interface ZoneEntityProps {
  zone: Zone;
  onSelect(): void;
  onChange(zone: Zone): void;
  pixelSize: number;
  isSelected: boolean;
}
const ZoneEntityShape = (props: ZoneEntityProps): JSX.Element => {
  const { zone, isSelected, pixelSize, onSelect, onChange } = props;
  const shapeRef = React.useRef<Konva.Rect>(null);
  const transformerRef = React.useRef<Konva.Transformer>(null);

  React.useEffect(() => {
    if (isSelected) {
      const transformer = transformerRef.current;
      const shape = shapeRef.current;
      if (transformer === null || shape === null) {
        return;
      }
      // we need to attach transformer manually
      transformer.nodes([shape]);
      transformer.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Rect
        {...zone.position}
        width={zone.width}
        height={zone.height}
        strokeWidth={5}
        stroke="#404040"
        fill="#FAFAFAAA"
        onClick={onSelect}
        onTap={onSelect}
        onDragStart={onSelect}
        ref={shapeRef}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...zone,
            position: {
              x: e.target.x(),
              y: e.target.y(),
            },
          });
        }}
        onTransformEnd={() => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          if (node === null) {
            return;
          }

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...zone,
            position: { x: node.x(), y: node.y() },
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 * pixelSize || newBox.height < 5 * pixelSize) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

interface ZonesLayerOverlayProps {
  zones: Zone[];
  onClear(): void;
}

const ZonesLayerOverlay = (props: ZonesLayerOverlayProps): JSX.Element => {
  const { zones, onClear } = props;
  const { data: status } = useRobotStatus((state) => state.value);
  const { mutate, isLoading: isMutating } = useCleanTemporaryZonesMutation({
    onSuccess: onClear,
  });

  const canClean = status === 'idle' || status === 'docked';
  const didSelectZones = zones.length > 0;

  const handleClick = React.useCallback(() => {
    if (!didSelectZones || !canClean) {
      return;
    }

    mutate(
      zones.map(({ iterations, position: { x, y }, width, height }) => ({
        iterations,
        points: {
          pA: {
            x: x,
            y: y,
          },
          pB: {
            x: x + width,
            y: y,
          },
          pC: {
            x: x + width,
            y: y + height,
          },
          pD: {
            x: x,
            y: y + height,
          },
        },
      }))
    );
  }, [canClean, didSelectZones, mutate, zones]);

  return (
    <Grid container alignItems="center" spacing={1} direction="row-reverse">
      <Grid item>
        <Zoom in>
          <LayerActionButton
            disabled={!didSelectZones || isMutating || !canClean}
            color="inherit"
            size="medium"
            variant="extended"
            onClick={handleClick}
          >
            Clean {zones.length} zones
            {isMutating && (
              <CircularProgress
                color="inherit"
                size={18}
                style={{ marginLeft: 10 }}
              />
            )}
          </LayerActionButton>
        </Zoom>
      </Grid>
      <Grid item>
        <Fade in={didSelectZones && !isMutating}>
          <LayerActionButton
            color="inherit"
            size="medium"
            variant="extended"
            onClick={onClear}
          >
            Clear
          </LayerActionButton>
        </Fade>
      </Grid>
      <Grid item>
        <Fade in={didSelectZones && !canClean}>
          <Typography variant="caption" color="textSecondary">
            Can only start zone cleaning when idle
          </Typography>
        </Fade>
      </Grid>
    </Grid>
  );
};

const ShownEntities = [
  RawMapEntityType.NoGoArea,
  RawMapEntityType.NoMopArea,
  RawMapEntityType.VirtualWall,
];

const useStyles = makeStyles(() => ({
  container: {
    flex: '1',
    height: '100%',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const ZonesLayer = (props: MapLayersProps): JSX.Element => {
  const { data, padding } = props;
  const classes = useStyles();
  const { data: properties, isLoading, isError, refetch } = useZoneProperties();
  const [zones, setZones] = React.useState<Zone[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>();
  const { enqueueSnackbar } = useSnackbar();

  const layers = useMapLayers(data);
  const entities = useMapEntities(
    React.useMemo(
      () => data.entities.filter(({ type }) => ShownEntities.includes(type)),
      [data.entities]
    )
  );

  const handleClear = React.useCallback(() => {
    setZones([]);
    setSelectedId(undefined);
  }, []);

  const handleClick = React.useCallback(
    (position: [number, number]) => {
      const maxZoneCount = properties?.zoneCount.max;
      if (maxZoneCount === undefined) {
        return;
      }

      if (zones.length >= maxZoneCount) {
        enqueueSnackbar(
          `A max of ${maxZoneCount} zones can be cleaned at once.`,
          {
            key: `${Capability.ZoneCleaning}:ZonesMaxed`,
            preventDuplicate: true,
            variant: 'info',
          }
        );
        return;
      }

      if (
        zones.some((zone) =>
          inside(position, {
            x: [zone.position.x, zone.position.x + zone.width],
            y: [zone.position.y, zone.position.y + zone.height],
          })
        )
      ) {
        return;
      }

      const [x, y] = position;
      const id = uuid.v4();

      setZones((prev) => [
        ...prev,
        {
          id,
          iterations: 1,
          position: { x: x - 50, y: y - 50 },
          width: 100,
          height: 100,
        },
      ]);
      setSelectedId(id);
    },
    [enqueueSnackbar, properties, zones]
  );

  const zoneEntities = React.useMemo(
    () =>
      zones.map((zone) => (
        <ZoneEntityShape
          key={zone.id}
          zone={zone}
          pixelSize={data.pixelSize}
          isSelected={selectedId === zone.id}
          onSelect={() => {
            setSelectedId(zone.id);
          }}
          onChange={(zone) => {
            setZones((prev) =>
              prev.map((old) => (old.id === zone.id ? zone : old))
            );
          }}
        />
      )),
    [data.pixelSize, selectedId, zones]
  );

  if (isError) {
    return (
      <Container className={classes.container}>
        <Typography color="error">
          Error loading {Capability.ZoneCleaning} properties
        </Typography>
        <Box m={1} />
        <Button color="primary" variant="contained" onClick={() => refetch()}>
          Retry
        </Button>
      </Container>
    );
  }

  if (properties === undefined && isLoading) {
    return (
      <Container className={classes.container}>
        <CircularProgress />
      </Container>
    );
  }

  if (properties === undefined) {
    return (
      <Container className={classes.container}>
        <Typography align="center">
          No {Capability.ZoneCleaning} properties
        </Typography>
        ;
      </Container>
    );
  }
  return (
    <>
      <Map
        layers={layers}
        entities={entities.concat(zoneEntities)}
        padding={padding}
        onClick={handleClick}
      />
      <LayerActionsContainer>
        <ZonesLayerOverlay onClear={handleClear} zones={zones} />
      </LayerActionsContainer>
    </>
  );
};

export default ZonesLayer;
