import {
  BrowserRouter,
  Link,
  Redirect,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom';
import MapPage from './map';
import ControlsPage from './controls';
import {
  Toolbar,
  AppBar,
  Box,
  makeStyles,
  IconButton,
  useMediaQuery,
  useTheme,
  BottomNavigationAction,
  BottomNavigation,
  Typography,
  Grid,
  Container,
} from '@material-ui/core';
import {
  Settings as SettingsIcon,
  Info as AboutIcon,
  Map as MapIcon,
  ControlCamera as ControlsIcon,
} from '@material-ui/icons';
import Div100vh from 'react-div-100vh';
import ControlsSpeedDial from './controls/ControlsSpeedDial';
import { useRobotState } from './api';
import BatteryIndicator from './BatteryIndicator';

const useAppStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1',
    display: 'flex',
    overflow: 'auto',
  },
}));

const useTopNavStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  toolbar: theme.mixins.toolbar,
}));

const TopNav = (): JSX.Element => {
  const classes = useTopNavStyles();
  const { data: status } = useRobotState((state) => state.status);

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap>
            Valetudo &ndash; {status !== undefined ? status : '?'}
          </Typography>
          <Box m={1} />
          <BatteryIndicator />
          <div className={classes.grow} />
          <IconButton color="inherit" component={Link} to="/settings">
            <SettingsIcon />
          </IconButton>
          <IconButton color="inherit" component={Link} to="/about">
            <AboutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} />
    </>
  );
};

const useBottomNavStyles = makeStyles((theme) => ({
  root: {
    height: 56 + theme.spacing(2),
  },
  action: {
    paddingBottom: theme.spacing(2),
  },
}));

const BottomNav = (): JSX.Element => {
  const classes = useBottomNavStyles();
  const location = useLocation();

  return (
    <BottomNavigation
      value={location.pathname}
      showLabels
      className={classes.root}
    >
      <BottomNavigationAction
        label="Map"
        icon={<MapIcon />}
        className={classes.action}
        component={Link}
        to="/map"
        value="/map"
      />
      <BottomNavigationAction
        label="Controls"
        icon={<ControlsIcon />}
        className={classes.action}
        component={Link}
        to="/controls"
        value="/controls"
      />
    </BottomNavigation>
  );
};

const useCombinedStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(1),
  },
}));

const CombinedView = (): JSX.Element => {
  const classes = useCombinedStyles();

  return (
    <Grid
      item
      container
      direction="row"
      spacing={2}
      justify="space-evenly"
      className={classes.container}
    >
      <Grid item sm={6} md={5} lg={4} xl={3}>
        <ControlsPage />
      </Grid>
      <Grid item sm md lg xl>
        <MapPage />
      </Grid>
    </Grid>
  );
};

const AppRouter = (): JSX.Element => {
  const classes = useAppStyles();
  const theme = useTheme();
  const largeView = useMediaQuery(theme.breakpoints.up('sm'), {
    noSsr: true,
  });

  return (
    <BrowserRouter>
      <Div100vh className={classes.container}>
        <TopNav />
        <main className={classes.content}>
          <Switch>
            <Route exact path="/">
              {largeView ? <CombinedView /> : <Redirect to="/map" />}
            </Route>
            <Route exact path="/map">
              {largeView ? <Redirect to="/" /> : <MapPage />}
            </Route>
            <Route exact path="/controls">
              {largeView ? (
                <Redirect to="/" />
              ) : (
                <Container>
                  <Box m={1} />
                  <ControlsPage />
                </Container>
              )}
            </Route>
            <Route exact path="/settings">
              <span>Settings</span>
            </Route>
            <Route exact path="/about">
              <span>About</span>
            </Route>
          </Switch>
        </main>
        <Box
          position="relative"
          bottom={theme.spacing(2)}
          right={theme.spacing(2)}
        >
          <ControlsSpeedDial />
        </Box>
        {!largeView && <BottomNav />}
      </Div100vh>
    </BrowserRouter>
  );
};

export default AppRouter;
