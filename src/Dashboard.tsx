import {
  Button,
  ButtonGroup,
  CircularProgress,
  Container,
} from '@material-ui/core';
import React from 'react';
import { useBasicControlCapability } from './capabilities';

const Dashboard = (): JSX.Element => {
  const [
    isBasicControlSupported,
    { loading, error },
    action,
  ] = useBasicControlCapability();

  React.useEffect(() => {
    console.log(error);
  }, [error]);

  return (
    <Container>
      {isBasicControlSupported && (
        <>
          {loading && <CircularProgress />}
          <ButtonGroup
            variant="contained"
            color="primary"
            aria-label="contained primary button group"
          >
            <Button onClick={() => action('start')}>Start</Button>
            <Button onClick={() => action('pause')}>Pause</Button>
            <Button onClick={() => action('stop')}>Stop</Button>
            <Button onClick={() => action('home')}>Home</Button>
          </ButtonGroup>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
