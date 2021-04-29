import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  Fade,
  FormControl,
  FormControlLabel,
  FormGroup,
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

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container justify="space-between" alignItems="center">
          <Grid item>
            <Typography>Zone presets</Typography>
          </Grid>
          {isLoading && (
            <Grid item>
              <Fade
                in={isLoading}
                style={{
                  transitionDelay: isLoading ? '800ms' : '0ms',
                }}
                unmountOnExit
              >
                <CircularProgress color="inherit" size="1rem" />
              </Fade>
            </Grid>
          )}
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        {isError ? (
          <Typography color="error">
            An error occurred while loading zone presets
          </Typography>
        ) : (
          <FormControl component="fieldset">
            <FormGroup>
              <FormLabel color="secondary" component="legend">
                Select zones to be cleaned
              </FormLabel>
              {zones?.map(({ name, id }) => (
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
          </FormControl>
        )}
      </AccordionDetails>
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
