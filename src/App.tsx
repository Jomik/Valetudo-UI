import { makeStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import HomeIcon from '@material-ui/icons/Home';
import SettingsIcon from '@material-ui/icons/Settings';
import MapIcon from '@material-ui/icons/Map';
import React from 'react';
import { Home } from './home/Home';

const useStyles = makeStyles({
  root: {},
});

export const App = (): JSX.Element => {
  const classes = useStyles();
  const [path, setPath] = React.useState(window.location.pathname);

  const handleChange = React.useCallback((_event: React.ChangeEvent<unknown>, newValue: string) => {
    setPath(newValue);
  }, []);

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/map">
          <span>Map</span>
        </Route>
        <Route path="/settings">
          <span>Settings</span>
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>

      <BottomNavigation
        value={path}
        onChange={handleChange}
        className={classes.root}
      >
        <BottomNavigationAction
          component={Link}
          to="/"
          label="Home"
          value="/"
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          component={Link}
          to="/map"
          label="Map"
          value="/map"
          icon={<MapIcon />}
        />
        <BottomNavigationAction
          component={Link}
          to="/settings"
          label="Settings"
          value="/settings"
          icon={<SettingsIcon />}
        />
      </BottomNavigation>
    </BrowserRouter>
  );
};
