import { Grid } from '@material-ui/core';
import {
  Opacity as WaterUsageIcon,
  Toys as FanSpeedIcon,
} from '@material-ui/icons';
import { Capability } from '../api';
import { useCapabilitiesSupported } from '../CapabilitiesProvider';
import GoToLocationPresets from './GoToPresets';
import IntensityControl from './IntensityControl';
import RobotStatus from './RobotStatus';
import Segments from './Segments';
import ZonePresets from './ZonePresets';

const ControlsPage = (): JSX.Element => {
  const [
    fanSpeed,
    waterControl,
    goToLocation,
    zoneCleaning,
    segmentCleaning,
    segmentNaming,
  ] = useCapabilitiesSupported(
    Capability.FanSpeedControl,
    Capability.WaterUsageControl,
    Capability.GoToLocation,
    Capability.ZoneCleaning,
    Capability.MapSegmentation,
    Capability.MapSegmentRename
  );

  return (
    <Grid container spacing={2} direction="column">
      <Grid item>
        <RobotStatus />
      </Grid>
      {fanSpeed && (
        <Grid item>
          <IntensityControl
            capability={Capability.FanSpeedControl}
            label="Fan speed"
            icon={<FanSpeedIcon fontSize="small" />}
          />
        </Grid>
      )}
      {waterControl && (
        <Grid item>
          <IntensityControl
            capability={Capability.WaterUsageControl}
            label="Water usage"
            icon={<WaterUsageIcon fontSize="small" />}
          />
        </Grid>
      )}
      {goToLocation && (
        <Grid item>
          <GoToLocationPresets />
        </Grid>
      )}
      {zoneCleaning && (
        <Grid item>
          <ZonePresets />
        </Grid>
      )}
      {segmentCleaning && segmentNaming && (
        <Grid item>
          <Segments />
        </Grid>
      )}
    </Grid>
  );
};

export default ControlsPage;
