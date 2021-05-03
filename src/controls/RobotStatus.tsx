import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Typography,
  withStyles,
} from '@material-ui/core';
import { green, red, yellow } from '@material-ui/core/colors';
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import React from 'react';
import { useRobotState } from '../api';

const BatteryProgress = withStyles((theme) => ({
  root: {
    borderRadius: theme.shape.borderRadius,
  },
  colorPrimary: {
    backgroundColor:
      theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  bar: {
    backgroundColor: green[700],
  },
}))(LinearProgress);

const RobotStatus = (): JSX.Element => {
  const { data: state, isLoading, isError } = useRobotState();

  const details = React.useMemo(() => {
    if (isError) {
      return (
        <Typography color="error">
          An error occurred while loading state
        </Typography>
      );
    }

    if (state === undefined) {
      return null;
    }

    const { battery, status, attachments } = state;

    return (
      <Grid container spacing={2} direction="column">
        <Grid item container direction="column">
          <Grid item xs container>
            <Grid item xs container direction="column">
              <Grid item>
                <Typography variant="subtitle2">State</Typography>
              </Grid>
              <Grid item>
                <Typography color="textSecondary">
                  {status.state}
                  {status.flag !== 'none' ? <> &ndash; {status.flag}</> : ''}
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs container direction="column">
              <Grid item>
                <Typography variant="subtitle2">Battery</Typography>
              </Grid>
              <Grid item>
                <Grid container>
                  {battery.status !== 'none' && (
                    <Grid item xs>
                      <Typography color="textSecondary">
                        {battery.status}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs>
                    <Typography
                      style={{
                        color:
                          battery.level > 80
                            ? green[500]
                            : battery.level > 20
                            ? yellow[500]
                            : red[500],
                      }}
                    >
                      {Math.round(battery.level)}%
                    </Typography>
                  </Grid>
                </Grid>
                <BatteryProgress
                  value={battery.level}
                  color="secondary"
                  variant={
                    battery.status === 'charging'
                      ? 'indeterminate'
                      : 'determinate'
                  }
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item container direction="column">
          <Grid item>
            <Typography variant="subtitle2">Attachments</Typography>
          </Grid>
          <Grid item>
            <ToggleButtonGroup size="small">
              {attachments.map(({ type, attached }) => (
                <ToggleButton selected={attached} key={type} value={type}>
                  {type}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Grid>
        </Grid>
      </Grid>
    );
  }, [isError, state]);

  return (
    <Accordion
      disabled={state === undefined && isLoading}
      defaultExpanded={true}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container spacing={3} alignItems="center" justify="space-between">
          <Grid item>
            <Typography>Status</Typography>
          </Grid>
          {state === undefined && isLoading && (
            <Grid item>
              <CircularProgress color="inherit" size="1rem" />
            </Grid>
          )}
        </Grid>
      </AccordionSummary>
      <Divider />
      <Box p={1} />
      <AccordionDetails>{details}</AccordionDetails>
    </Accordion>
  );
};

export default RobotStatus;
