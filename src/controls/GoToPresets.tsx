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
  useRobotStatus,
} from '../api';

const useStyles = makeStyles(() => ({
  formControl: {
    minWidth: 120,
  },
}));

const GoToLocationPresets = (): JSX.Element => {
  const classes = useStyles();
  const { data: state } = useRobotStatus((status) => status.value);
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
    if (selected === '') {
      return;
    }

    if (state !== 'docked' && state !== 'idle') {
      return;
    }
    goToLocation(selected);
  }, [goToLocation, selected, state]);

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
      <>
        <Grid item>
          <FormControl color="secondary" className={classes.formControl}>
            <Select value={selected} onChange={handleChange} displayEmpty>
              <MenuItem value="">
                <em>Location</em>
              </MenuItem>
              {locations?.map(({ name, id }) => (
                <MenuItem key={id} value={id}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs>
          <Box display="flex" justifyContent="flex-end">
            <Button disabled={!selected || isCommandLoading} onClick={handleGo}>
              Go
            </Button>
          </Box>
        </Grid>
      </>
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
        <Grid container direction="row" alignItems="center" spacing={1}>
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
