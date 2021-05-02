import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@material-ui/core';
import React from 'react';
import {
  Capability,
  useGoToLocationPresetMutation,
  useGoToLocationPresets,
  useRobotState,
} from '../api';

const useStyles = makeStyles(() => ({
  formControl: {
    minWidth: 120,
  },
}));

const GoToLocationPresets = (): JSX.Element => {
  const classes = useStyles();
  const { data: status } = useRobotState((state) => state.status.state);
  const {
    data: locations,
    isLoading: isLocationsLoading,
    isError,
  } = useGoToLocationPresets();
  const {
    isLoading: isCommandLoading,
    mutate: goToLocation,
  } = useGoToLocationPresetMutation();
  const [selected, setSelected] = React.useState<string>('');

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      setSelected(event.target.value as string);
    },
    []
  );

  const handleGo = React.useCallback(() => {
    if (selected === undefined) {
      return;
    }

    if (status !== 'docked' && status !== 'idle') {
      return;
    }
    goToLocation(selected);
  }, [goToLocation, selected, status]);

  const body = React.useMemo(() => {
    if (isLocationsLoading) {
      return (
        <Grid item>
          <CircularProgress size={20} />
        </Grid>
      );
    }

    if (isError || locations === undefined) {
      return (
        <Grid item>
          <Typography color="error">
            Error loading {Capability.GoToLocation}
          </Typography>
        </Grid>
      );
    }

    return (
      <Grid item xs container justify="space-between" alignContent="center">
        <Grid item>
          <FormControl color="secondary" className={classes.formControl}>
            <Select
              labelId="gotolocation-label"
              value={selected}
              onChange={handleChange}
              displayEmpty
            >
              <MenuItem value="">
                <em>Nowhere</em>
              </MenuItem>
              {locations?.map(({ name, id }) => (
                <MenuItem key={id} value={id}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <Button disabled={!selected || isCommandLoading} onClick={handleGo}>
            Go
          </Button>
        </Grid>
      </Grid>
    );
  }, [
    classes.formControl,
    handleChange,
    handleGo,
    isCommandLoading,
    isError,
    isLocationsLoading,
    locations,
    selected,
  ]);

  return (
    <Paper>
      <Box px={2} py={1}>
        <Grid container direction="row" alignContent="center" spacing={1}>
          <Grid item>
            <Typography variant="subtitle1">Go to</Typography>
          </Grid>
          {body}
        </Grid>
      </Box>
    </Paper>
  );
};

export default GoToLocationPresets;
