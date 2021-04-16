import { Container, Grid, Paper } from '@material-ui/core';
import {
  Opacity as WaterUsageIcon,
  Toys as FanSpeedIcon,
} from '@material-ui/icons';
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
                icon={<FanSpeedIcon fontSize="small" />}
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
                icon={<WaterUsageIcon fontSize="small" />}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ControlsPage;
