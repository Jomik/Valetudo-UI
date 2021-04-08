import {
  ListSubheader,
  Menu,
  MenuItem,
  PopoverPosition,
} from '@material-ui/core';
import { Vector2d } from 'konva/types/types';
import { MapLayerMetaData } from './MapData';

export interface MapMenuProps {
  anchorPosition?: PopoverPosition;
  segment?: MapLayerMetaData;
  position?: Vector2d;
  open: boolean;
  onClose(): void;
}

const DefaultAnchorPosition: PopoverPosition = {
  top: 0,
  left: 0,
};

const MapMenu = (props: MapMenuProps): JSX.Element => {
  const { anchorPosition, open, onClose, segment } = props;
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
          {(
            (segment.name ?? '') +
            ` # ${segment.segmentId}, Area: ${segment.area}`
          ).trim()}
        </ListSubheader>
      )}
      <MenuItem onClick={onClose}>Go here</MenuItem>
      {segment !== undefined && (
        <MenuItem onClick={onClose}>Add segment</MenuItem>
      )}
      <MenuItem onClick={onClose}>Add zone</MenuItem>
    </Menu>
  );
};

export default MapMenu;
