import {
  ListSubheader,
  Menu,
  MenuItem,
  MenuItemProps,
  PopoverPosition,
} from '@material-ui/core';
import React from 'react';
import {
  Capability,
  RawMapLayerMetaData,
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

interface GoToItemProps extends MenuItemProps {
  position?: Coordinates;
}
const GoToItem = (props: GoToItemProps): JSX.Element | null => {
  const { onClick, position, ...rest } = props;
  const { data: status } = useRobotState((state) => state.status.state);
  const { mutate: sendGoTo } = useGoToMutation();

  const handleGoTo = React.useCallback<React.MouseEventHandler<HTMLLIElement>>(
    (event) => {
      onClick?.(event);
      if (position === undefined) {
        // _Should_ never end up here.
        return;
      }

      sendGoTo(position);
    },
    [onClick, position, sendGoTo]
  );

  if (position === undefined || status === undefined) {
    return null;
  }

  if (status !== 'idle' && status !== 'docked') {
    return null;
  }

  return (
    <MenuItem {...rest} button onClick={handleGoTo}>
      Go here
    </MenuItem>
  );
};

const MapMenu = (props: MapMenuProps): JSX.Element => {
  const { anchorPosition, open, onClose, segment, position } = props;
  const [goto] = useCapabilitiesSupported(Capability.GoToLocation);
  const roundedArea =
    segment?.area !== undefined
      ? ((segment?.area ?? 1) * 0.0001).toFixed(1)
      : '?';

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
      {goto && <GoToItem onClick={onClose} position={position} />}
      {segment !== undefined && (
        <MenuItem button onClick={onClose}>
          Add segment
        </MenuItem>
      )}
      <MenuItem button onClick={onClose}>
        Add zone
      </MenuItem>
    </Menu>
  );
};

export default MapMenu;
