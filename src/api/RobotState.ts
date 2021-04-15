import { BatteryState, StatusState } from './RawRobotState';

export interface RobotState {
  status: StatusState['value'];
  battery: {
    status: BatteryState['value'];
    level: BatteryState['level'];
  };
}
