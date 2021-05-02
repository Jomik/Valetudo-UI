import { Capability } from './Capability';
import {
  AttachmentState,
  BatteryState,
  IntensityState,
  StatusState,
} from './RawRobotState';

export interface RobotState {
  status: {
    state: StatusState['value'];
    flag: StatusState['flag'];
  };
  battery: {
    status: BatteryState['flag'];
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
  attachments: Pick<AttachmentState, 'type' | 'attached'>[];
}
