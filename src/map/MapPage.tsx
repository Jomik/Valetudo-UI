import {
  Box,
  Button,
  CircularProgress,
  Container,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { useLatestMap } from '../api';
import Map from './Map';
import MapSpeedDial from './MapSpeedDial';

const useMapStyles = makeStyles(() => ({
  container: {
    flex: '1',
    height: '100%',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const MapContainer = () => {
  const [{ data, loading, error }, refetch] = useLatestMap();
  const classes = useMapStyles();

  if (error) {
    return (
      <Container className={classes.container}>
        <Typography color="error">Error loading map data</Typography>
        <Box m={1} />
        <Button color="primary" variant="contained" onClick={() => refetch()}>
          Retry
        </Button>
      </Container>
    );
  }

  if (!data && loading) {
    return (
      <Container className={classes.container}>
        <CircularProgress />
      </Container>
    );
  }

  if (!data) {
    return (
      <Container className={classes.container}>
        <Typography align="center">No map data</Typography>;
      </Container>
    );
  }

  return <Map mapData={data} />;
};

const MapPage = (): JSX.Element => {
  return (
    <>
      <MapContainer />
      <Box position="relative">
        <MapSpeedDial />
      </Box>
    </>
  );
};

export default MapPage;
