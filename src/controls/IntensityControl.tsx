import {
  Box,
  CircularProgress,
  Grid,
  Mark,
  Slider,
  Switch,
  Typography,
  withStyles,
} from '@material-ui/core';
import React from 'react';
import {
  Capability,
  IntensityState,
  useIntensityMutation,
  useIntensityPresets,
  useRobotStateQuery,
} from '../api';

const DiscreteSlider = withStyles((theme) => ({
  track: {
    height: 2,
  },
  rail: {
    height: 2,
    opacity: 0.5,
    backgroundColor: theme.palette.grey[400],
  },
  mark: {
    backgroundColor: theme.palette.grey[400],
    height: 8,
    width: 1,
    marginTop: -3,
  },
  markActive: {
    opacity: 1,
    backgroundColor: 'currentColor',
  },
}))(Slider);

export interface IntensityControlProps {
  capability: Capability.FanSpeedControl | Capability.WaterUsageControl;
  label: string;
}

const IntensityControl = (props: IntensityControlProps): JSX.Element => {
  const { capability, label } = props;
  const { data: state } = useRobotStateQuery();
  const { isLoading, isError, data: presets } = useIntensityPresets(capability);
  const { mutate } = useIntensityMutation(capability);
  const intensity = state?.intensity?.[capability];
  const hasOff = presets?.includes('off') ?? false;
  const filteredPresets = presets?.filter(
    (x): x is Exclude<IntensityState['value'], 'off' | 'custom'> =>
      x !== 'off' && x !== 'custom'
  );
  const [sliderValue, setSliderValue] = React.useState(0);

  React.useEffect(() => {
    if (intensity === undefined) {
      return;
    }

    if (intensity.level === 'off') {
      setSliderValue(0);
      return;
    }

    const index =
      filteredPresets?.findIndex((x) => x === intensity.level) ?? -1;

    setSliderValue(index !== -1 ? index : 0);
  }, [intensity, filteredPresets]);

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
      <Box p={2}>
        <Grid container justify="center">
          <Grid item>
            <CircularProgress />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (isError || intensity === undefined || filteredPresets === undefined) {
    return (
      <Box p={2}>
        <Grid container>
          <Grid item>
            <Typography color="error">
              Error loading {capability} data
            </Typography>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box px={3}>
        <Grid container direction="column">
          <Grid item>
            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                <Typography
                  variant="subtitle1"
                  id={`${capability}-slider-label`}
                >
                  {label}
                </Typography>
              </Grid>
              {hasOff && (
                <Grid item>
                  <Switch
                    checked={intensity.level !== 'off'}
                    onChange={handleToggle}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
          <Grid item>
            <DiscreteSlider
              aria-labelledby={`${capability}-slider-label`}
              step={null}
              value={sliderValue}
              valueLabelDisplay="off"
              onChange={handleSliderChange}
              onChangeCommitted={handleSliderCommitted}
              min={0}
              max={marks.length - 1}
              marks={marks}
              disabled={intensity.level === 'off'}
              color="secondary"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default IntensityControl;
