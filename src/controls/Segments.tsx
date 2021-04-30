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
  Segment,
  useCleanSegmentsMutation,
  useRobotState,
  useSegments,
} from '../api';

const Segments = (): JSX.Element => {
  const { data: status } = useRobotState((state) => state.status.state);
  const {
    data: segments,
    isLoading: isSegmentsLoading,
    isError,
    refetch,
  } = useSegments();
  const {
    isLoading: isCleaningLoading,
    mutate: cleanSegments,
  } = useCleanSegmentsMutation();
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const isLoading = isSegmentsLoading || isCleaningLoading;

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
    cleanSegments(
      Object.entries(selected)
        .filter(([, selected]) => selected)
        .map(([id]) => id)
    );
  }, [cleanSegments, selected]);

  const namedSegments = segments?.filter(
    (segment): segment is Segment & { name: NonNullable<Segment['name']> } =>
      segment.name !== undefined
  );
  const noSegmentsSelected = Object.values(selected).every((val) => !val);

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container justify="space-between" alignItems="center">
          <Grid item>
            <Typography>Segments</Typography>
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
            An error occurred while loading segments
          </Typography>
        ) : (
          <FormControl component="fieldset">
            <FormGroup>
              <FormLabel color="secondary" component="legend">
                Select segments to be cleaned
              </FormLabel>
              {namedSegments?.map(({ name, id }) => (
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
              noSegmentsSelected || (status !== 'idle' && status !== 'docked')
            }
            onClick={handleClean}
          >
            Clean segments
          </Button>
        )}
      </AccordionActions>
    </Accordion>
  );
};

export default Segments;
