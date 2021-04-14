import {
  BrowserRouter,
  Link,
  Redirect,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom';
import MapPage from './map';
import ConfigurationPage from './configuration';
import {
  Toolbar,
  Box,
  AppBar,
  makeStyles,
  IconButton,
  useMediaQuery,
  useTheme,
  BottomNavigationAction,
  BottomNavigation,
  Typography,
} from '@material-ui/core';
import {
  Settings as SettingsIcon,
  Info as AboutIcon,
  Map as MapIcon,
  Tune as ConfigurationIcon,
} from '@material-ui/icons';
import Div100vh from 'react-div-100vh';

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

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap>
            Valetudo
          </Typography>
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
        label="Configuration"
        icon={<ConfigurationIcon />}
        className={classes.action}
        component={Link}
        to="/configuration"
        value="/configuration"
      />
    </BottomNavigation>
  );
};

const CombinedView = (): JSX.Element => {
  return (
    <>
      <Box flex={1}>
        <ConfigurationPage />
      </Box>
      <Box flex={3} height="100%">
        <MapPage />
      </Box>
    </>
  );
};

const AppRouter = (): JSX.Element => {
  const classes = useAppStyles();
  const theme = useTheme();
  const splitView = useMediaQuery(theme.breakpoints.up('sm'), {
    defaultMatches: true,
  });

  return (
    <BrowserRouter>
      <Div100vh className={classes.container}>
        <TopNav />
        <main className={classes.content}>
          <Switch>
            <Route exact path="/">
              {splitView ? <CombinedView /> : <Redirect to="/map" />}
            </Route>
            <Route exact path="/map">
              {splitView ? <Redirect to="/" /> : <MapPage />}
            </Route>
            <Route exact path="/configuration">
              {splitView ? <Redirect to="/" /> : <ConfigurationPage />}
            </Route>
            <Route exact path="/settings">
              <span>Settings</span>
            </Route>
            <Route exact path="/about">
              <span>About</span>
            </Route>
          </Switch>
        </main>
        {!splitView && <BottomNav />}
      </Div100vh>
    </BrowserRouter>
  );
};

export default AppRouter;
