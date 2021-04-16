import { Capability } from './Capability';
import { BatteryState, IntensityState, StatusState } from './RawRobotState';

export interface RobotState {
  status: StatusState['value'];
  battery: {
    status: BatteryState['value'];
    level: BatteryState['level'];
  };
  intensity: {
    [Capability.FanSpeedControl]?: {
      level: IntensityState['value'];
      customValue?: IntensityState['customValue'];
    };
    [Capability.WaterUsageControl]?: {
      level: IntensityState['value'];
      customValue?: IntensityState['customValue'];
    };
  };
}
