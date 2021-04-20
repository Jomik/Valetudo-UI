import {
  ListSubheader,
  Menu,
  MenuItem,
  PopoverPosition,
} from '@material-ui/core';
import React from 'react';
import {
  Capability,
  RawMapLayerMetaData,
  RobotState,
  useGoToMutation,
  useRobotState,
} from '../api';
import { Coordinates } from '../api/client';
import { useCapabilitiesSupported } from '../CapabilitiesProvider';

export interface MapMenuProps {
  anchorPosition?: PopoverPosition;
  segment?: RawMapLayerMetaData;
  position?: Coordinates;
  open: boolean;
  onClose(): void;
}

const DefaultAnchorPosition: PopoverPosition = {
  top: 0,
  left: 0,
};

const gotoEnabledStates = new Set<RobotState['status']['state']>([
  'idle',
  'docked',
]);
const MapMenu = (props: MapMenuProps): JSX.Element => {
  const { anchorPosition, open, onClose, segment, position } = props;
  const { data: status } = useRobotState((state) => state.status.state);
  const [isGoToSupported] = useCapabilitiesSupported(Capability.GoToLocation);
  const { mutate: sendGoTo } = useGoToMutation();
  const roundedArea =
    segment?.area !== undefined
      ? ((segment?.area ?? 1) * 0.0001).toFixed(1)
      : '?';

  const handleGoTo = React.useCallback(() => {
    onClose();
    if (position === undefined) {
      // _Should_ never end up here.
      return;
    }

    sendGoTo(position);
  }, [onClose, position, sendGoTo]);

  return (
    <Menu
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition ?? DefaultAnchorPosition}
      keepMounted
      open={open}
      onClose={onClose}
    >
      {segment !== undefined && (
        <ListSubheader>
          {`id: ${segment.segmentId}, area: ${roundedArea}m²`.trim()}
        </ListSubheader>
      )}
      {position !== undefined &&
        status !== undefined &&
        gotoEnabledStates.has(status) &&
        isGoToSupported && <MenuItem onClick={handleGoTo}>Go here</MenuItem>}
      {segment !== undefined && (
        <MenuItem onClick={onClose}>Add segment</MenuItem>
      )}
      <MenuItem onClick={onClose}>Add zone</MenuItem>
    </Menu>
  );
};

export default MapMenu;
