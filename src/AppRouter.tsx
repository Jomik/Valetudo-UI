import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import MapPage from './map';
import ControlsPage from './controls';
import {
  Toolbar,
  AppBar,
  makeStyles,
  IconButton,
  useMediaQuery,
  useTheme,
  Typography,
  Grid,
  Divider,
} from '@material-ui/core';
import {
  Settings as SettingsIcon,
  Info as AboutIcon,
} from '@material-ui/icons';
import Div100vh from 'react-div-100vh';
import ControlsBottomSheet from './controls/ControlsBottomSheet';
import ControlsSpeedDial from './controls/ControlsSpeedDial';

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

const useHomeStyles = makeStyles((theme) => ({
  container: {
    margin: theme.spacing(1),
  },
}));

const HomePage = (): JSX.Element => {
  const classes = useHomeStyles();
  const theme = useTheme();
  const largeView = useMediaQuery(theme.breakpoints.up('sm'), {
    noSsr: true,
  });

  if (largeView) {
    return (
      <>
        <Grid
          item
          container
          direction="row"
          spacing={2}
          justify="space-evenly"
          className={classes.container}
        >
          <Grid item sm md lg xl>
            <MapPage />
          </Grid>
          <Divider orientation="vertical" />
          <Grid item sm={6} md={5} lg={4} xl={3}>
            <ControlsPage />
          </Grid>
        </Grid>
        <ControlsSpeedDial />
      </>
    );
  }

  return (
    <>
      <MapPage />
      <ControlsBottomSheet />
    </>
  );
};

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

const AppRouter = (): JSX.Element => {
  const classes = useAppStyles();

  return (
    <BrowserRouter>
      <Div100vh className={classes.container}>
        <TopNav />
        <main className={classes.content}>
          <Switch>
            <Route exact path="/">
              <HomePage />
            </Route>
            <Route exact path="/settings">
              <span>Settings</span>
            </Route>
            <Route exact path="/about">
              <span>About</span>
            </Route>
          </Switch>
        </main>
      </Div100vh>
    </BrowserRouter>
  );
};

export default AppRouter;
