import {
  Container,
  createStyles,
  FormControl,
  InputLabel,
  Select,
} from '@material-ui/core';
import React from 'react';
import Map from './Map';
import { MapData } from './MapData';
import dreame_1c_1096_areacleanup from './mock/1c_1096_areacleanup.json';
import dreame_1c_1096_fullcleanup from './mock/1c_1096_fullcleanup.json';
import dreame_1c_1096_virtualwall_and_forbidden_zone from './mock/1c_1096_virtualwall_and_forbidden_zone.json';
import dreame_1c_1096_zonedcleanup from './mock/1c_1096_zonedcleanup.json';
import dreame_d9_1058_with_custom_named_segments from './mock/d9_1058_with_custom_named_segments.json';
import dreame_d9_1058_with_segments from './mock/d9_1058_with_segments.json';
import roborock_FW1886_with_forbidden_zones_and_virtual_walls_and_currently_cleaned_zones from './mock/FW1886_with_forbidden_zones_and_virtual_walls_and_currently_cleaned_zones.json';
import roborock_FW1886_with_goto_target from './mock/FW1886_with_goto_target.json';
import roborock_FW1886_without_extra_data from './mock/FW1886_without_extra_data.json';
import roborock_FW2008_with_forbidden_zones_and_virtual_walls_and_currently_cleaned_zones from './mock/FW2008_with_forbidden_zones_and_virtual_walls_and_currently_cleaned_zones.json';
import roborock_FW2008_with_segments from './mock/FW2008_with_segments.json';
import roborock_FW2020_with_segments from './mock/FW2020_with_segments.json';
import roborock_FW2020_with_segments_cleaning from './mock/FW2020_with_segments_cleaning.json';
import { makeStyles } from '@material-ui/core';

const mockMapData: Record<string, MapData> = {
  roborock_FW2020_with_segments_cleaning: roborock_FW2020_with_segments_cleaning as MapData,
  dreame_1c_1096_areacleanup: dreame_1c_1096_areacleanup as MapData,
  dreame_1c_1096_fullcleanup: dreame_1c_1096_fullcleanup as MapData,
  dreame_1c_1096_virtualwall_and_forbidden_zone: dreame_1c_1096_virtualwall_and_forbidden_zone as MapData,
  dreame_1c_1096_zonedcleanup: dreame_1c_1096_zonedcleanup as MapData,
  dreame_d9_1058_with_custom_named_segments: dreame_d9_1058_with_custom_named_segments as MapData,
  dreame_d9_1058_with_segments: dreame_d9_1058_with_segments as MapData,
  roborock_FW1886_with_forbidden_zones_and_virtual_walls_and_currently_cleaned_zones: roborock_FW1886_with_forbidden_zones_and_virtual_walls_and_currently_cleaned_zones as MapData,
  roborock_FW1886_with_goto_target: roborock_FW1886_with_goto_target as MapData,
  roborock_FW1886_without_extra_data: roborock_FW1886_without_extra_data as MapData,
  roborock_FW2008_with_forbidden_zones_and_virtual_walls_and_currently_cleaned_zones: roborock_FW2008_with_forbidden_zones_and_virtual_walls_and_currently_cleaned_zones as MapData,
  roborock_FW2008_with_segments: roborock_FW2008_with_segments as MapData,
  roborock_FW2020_with_segments: roborock_FW2020_with_segments as MapData,
};

const useStyles = makeStyles((theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
  })
);

const Page = (): JSX.Element => {
  const classes = useStyles();
  const [mapDataKey, setMapDataKey] = React.useState<string>(
    Object.keys(mockMapData)[0]
  );

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      setMapDataKey(event.target.value as string);
    },
    []
  );

  return (
    <Container>
      <FormControl className={classes.formControl}>
        <InputLabel id="map-data-select-label">Map Data</InputLabel>
        <Select
          native
          labelId="map-data-select-label"
          onChange={handleChange}
          value={mapDataKey}
        >
          {Object.keys(mockMapData).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </FormControl>
      <Map mapData={mockMapData[mapDataKey]} />
    </Container>
  );
};

export default Page;
