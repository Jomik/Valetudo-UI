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

const useStyles = makeStyles(() => ({
  container: {
    flex: '1 1 auto',
    display: 'flex',
    flexFlow: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const Page = (): JSX.Element => {
  const [{ data, loading, error }, refetch] = useLatestMap();
  const classes = useStyles();

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

export default Page;
