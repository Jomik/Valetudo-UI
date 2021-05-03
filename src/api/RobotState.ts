import { Capability } from './Capability';
import {
  AttachmentState,
  BatteryState,
  PresetSelectionState,
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
  presets: {
    [Capability.FanSpeedControl]?: {
      level: PresetSelectionState['value'];
      customValue?: PresetSelectionState['customValue'];
    };
    [Capability.WaterUsageControl]?: {
      level: PresetSelectionState['value'];
      customValue?: PresetSelectionState['customValue'];
    };
  };
  attachments: Pick<AttachmentState, 'type' | 'attached'>[];
}
