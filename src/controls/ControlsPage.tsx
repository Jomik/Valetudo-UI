import { Container, Grid, Paper } from '@material-ui/core';
import { Capability } from '../api';
import { useCapabilitiesSupported } from '../CapabilitiesProvider';
import IntensityControl from './IntensityControl';

const ControlsPage = (): JSX.Element => {
  const [fanSpeed, waterControl] = useCapabilitiesSupported(
    Capability.FanSpeedControl,
    Capability.WaterUsageControl
  );

  return (
    <Container>
      <Grid container spacing={2} direction="column">
        {fanSpeed && (
          <Grid item>
            <Paper>
              <IntensityControl
                capability={Capability.FanSpeedControl}
                label="Fan speed"
              />
            </Paper>
          </Grid>
        )}
        {waterControl && (
          <Grid item>
            <Paper>
              <IntensityControl
                capability={Capability.WaterUsageControl}
                label="Water usage"
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ControlsPage;
