import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  Typography,
} from '@material-ui/core';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import React from 'react';
import {
  useCleanZonePresetsMutation,
  useRobotState,
  useZonePresets,
} from '../api';

const ZonePresets = (): JSX.Element => {
  const { data: status } = useRobotState((state) => state.status.state);
  const {
    data: zones,
    isLoading: isZonesLoading,
    isError,
    refetch,
  } = useZonePresets();
  const {
    isLoading: isCleaningLoading,
    mutate: cleanZones,
  } = useCleanZonePresetsMutation();
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const isLoading = isZonesLoading || isCleaningLoading;

  const handleCheckboxChange = React.useCallback(
    ({ target }: React.ChangeEvent<HTMLInputElement>) => {
      setSelected((prev) => ({
        ...prev,
        [target.id]: target.checked,
      }));
    },
    []
  );
  const handleRetry = React.useCallback(() => {
    refetch();
  }, [refetch]);

  const handleClean = React.useCallback(() => {
    cleanZones(
      Object.entries(selected)
        .filter(([, selected]) => selected)
        .map(([id]) => id)
    );
  }, [cleanZones, selected]);

  const noZonesSelected = Object.values(selected).every((val) => !val);

  const details = React.useMemo(() => {
    if (isError) {
      return (
        <Typography color="error">
          An error occurred while loading zones
        </Typography>
      );
    }

    if (zones === undefined || zones.length === 0) {
      return <Typography>No zone presets found</Typography>;
    }

    return (
      <FormControl component="fieldset">
        <FormGroup>
          <FormLabel color="secondary" component="legend">
            Select zones to be cleaned
          </FormLabel>
          {zones.map(({ name, id }) => (
            <FormControlLabel
              key={id}
              control={
                <Checkbox
                  checked={selected[id] ?? false}
                  onChange={handleCheckboxChange}
                  id={id}
                />
              }
              label={name}
            />
          ))}
        </FormGroup>
        <FormHelperText>Can only start cleaning when idle</FormHelperText>
      </FormControl>
    );
  }, [handleCheckboxChange, isError, selected, zones]);

  return (
    <Accordion disabled={zones === undefined && isLoading}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container justify="space-between" alignItems="center">
          <Grid item>
            <Typography>Zone presets</Typography>
          </Grid>
          {isLoading && (
            <Grid item>
              <CircularProgress color="inherit" size="1rem" />
            </Grid>
          )}
        </Grid>
      </AccordionSummary>
      <Divider />
      <AccordionDetails>{details}</AccordionDetails>
      <Divider />
      <AccordionActions>
        {isError ? (
          <Button size="small" onClick={handleRetry}>
            Retry
          </Button>
        ) : (
          <Button
            size="small"
            disabled={
              noZonesSelected || (status !== 'idle' && status !== 'docked')
            }
            onClick={handleClean}
          >
            Clean zones
          </Button>
        )}
      </AccordionActions>
    </Accordion>
  );
};

export default ZonePresets;
