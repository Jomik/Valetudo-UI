import {
  Box,
  Button,
  CircularProgress,
  Container,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { useRobotMap } from '../api';
import Map from './Map';
import MapContextProvider from './MapContextProvider';
import MapControls from './MapControls';

const useStyles = makeStyles(() => ({
  container: {
    flex: '1',
    height: '100%',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const MapPage = (): JSX.Element => {
  const { data, isLoading, isError, refetch } = useRobotMap();
  const classes = useStyles();

  if (isError) {
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

  if (!data && isLoading) {
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

  return (
    <MapContextProvider>
      <MapControls />
      <Map mapData={data} />
    </MapContextProvider>
  );
};

export default MapPage;
