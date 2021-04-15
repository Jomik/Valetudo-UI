import { BatteryState, IntensityState, StatusState } from './RawRobotState';

export interface RobotState {
  status: StatusState['value'];
  battery: {
    status: BatteryState['value'];
    level: BatteryState['level'];
  };
  intensity: Partial<
    Record<
      IntensityState['type'],
      {
        level: IntensityState['value'];
        customValue: IntensityState['customValue'];
      }
    >
  >;
}
