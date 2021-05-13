import Map from '../Map';
import { MapLayersProps } from './types';
import { useDefaultMapData } from './hooks';

const ViewLayer = (props: MapLayersProps): JSX.Element => {
  const { data, padding } = props;

  const mapData = useDefaultMapData(data);

  return <Map {...mapData} padding={padding} />;
};

export default ViewLayer;
