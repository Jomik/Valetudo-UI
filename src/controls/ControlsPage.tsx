import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Mark,
  Paper,
  Slider,
  Switch,
  Typography,
} from '@material-ui/core';
import React from 'react';
import {
  Capability,
  IntensityState,
  useFanSpeedMutation,
  useFanSpeedPresets,
  useRobotStateQuery,
} from '../api';
import { useCapabilitySupported } from '../CapabilitiesProvider';

const FanSpeedControl = (): JSX.Element => {
  const { data: state } = useRobotStateQuery();
  const { isLoading, isError, data: presets } = useFanSpeedPresets();
  const { mutate } = useFanSpeedMutation();
  const fanSpeed = state?.intensity?.fan_speed;
  const hasOff = presets?.includes('off') ?? false;
  const filteredPresets = presets?.filter(
    (x): x is Exclude<IntensityState['value'], 'off' | 'custom'> =>
      x !== 'off' && x !== 'custom'
  );
  const [sliderValue, setSliderValue] = React.useState(0);

  React.useEffect(() => {
    if (fanSpeed === undefined) {
      return;
    }

    if (fanSpeed.level === 'off') {
      setSliderValue(0);
      return;
    }

    const index = filteredPresets?.findIndex((x) => x === fanSpeed.level) ?? -1;

    setSliderValue(index !== -1 ? index : 0);
  }, [fanSpeed, filteredPresets]);

  const marks = React.useMemo<Mark[]>(() => {
    if (filteredPresets === undefined) {
      return [];
    }

    return filteredPresets.map((preset, index) => ({
      value: index,
      label: preset,
    }));
  }, [filteredPresets]);

  const handleToggle = React.useCallback(
    (_event: React.ChangeEvent, checked: boolean) => {
      if (presets === undefined) {
        return;
      }
      mutate(checked ? presets[0] : 'off');
    },
    [mutate, presets]
  );

  const handleSliderChange = React.useCallback(
    (_event: React.ChangeEvent<unknown>, value: number | number[]) => {
      if (typeof value !== 'number') {
        return;
      }

      setSliderValue(value);
    },
    []
  );
  const handleSliderCommitted = React.useCallback(
    (_event: React.ChangeEvent<unknown>, value: number | number[]) => {
      if (typeof value !== 'number' || filteredPresets === undefined) {
        return;
      }

      setSliderValue(value);
      const level = filteredPresets[value];
      mutate(level);
    },
    [mutate, filteredPresets]
  );

  if (isLoading) {
    return (
      <Box py={2} px={3}>
        <Grid container justify="center">
          <Grid item>
            <CircularProgress />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (isError || fanSpeed === undefined || filteredPresets === undefined) {
    return (
      <Box py={2} px={3}>
        <Grid container>
          <Grid item>
            <Typography color="error">Error loading fan speed</Typography>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box py={2} px={3}>
      <Grid container direction="column">
        <Grid item>
          <Grid container justify="space-between" alignItems="center">
            <Grid item>
              <Typography id="fanspeed-slider">Fan speed</Typography>
            </Grid>
            {hasOff && (
              <Grid item>
                <Switch
                  checked={fanSpeed.level !== 'off'}
                  onChange={handleToggle}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item>
          <Slider
            aria-labelledby="fanspeed-slider"
            step={null}
            value={sliderValue}
            valueLabelDisplay="off"
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderCommitted}
            min={0}
            max={marks.length - 1}
            marks={marks}
            disabled={fanSpeed.level === 'off'}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const ControlsPage = (): JSX.Element => {
  const isFanSpeedSupported = useCapabilitySupported(
    Capability.FanSpeedControl
  );

  return (
    <Container>
      <Grid container spacing={2} direction="column">
        {isFanSpeedSupported && (
          <Grid item>
            <Paper>
              <FanSpeedControl />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ControlsPage;
