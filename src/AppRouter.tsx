import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom';
import MapPage from './map';
import {
  fade,
  InputBase,
  MenuItem as MenuItemFoo,
  Select,
  Toolbar,
  Typography,
  AppBar,
  makeStyles,
  IconButton,
} from '@material-ui/core';
import {
  Settings as SettingsIcon,
  Info as AboutIcon,
} from '@material-ui/icons';

// Stupid types workaround..
const MenuItem = MenuItemFoo as any;

const useAppStyles = makeStyles((theme) => ({
  content: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
}));

const useNavStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  dropdown: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1),
  },
  toolbar: theme.mixins.toolbar,
}));

const Nav = (): JSX.Element => {
  const classes = useNavStyles();
  const location = useLocation();

  return (
    <div className={classes.grow}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap className={classes.title}>
            Valetudo
          </Typography>
          <Select
            value={location.pathname}
            className={classes.dropdown}
            input={
              <InputBase
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': 'search' }}
              />
            }
          >
            <MenuItem component={Link} to="/" value="/">
              Map
            </MenuItem>
            <MenuItem component={Link} to="/presets" value="/presets">
              Presets
            </MenuItem>
            <MenuItem component={Link} to="/control" value="/control">
              Manual Control
            </MenuItem>
          </Select>
          <div className={classes.grow} />
          <IconButton color="inherit" component={Link} to={'/settings'}>
            <SettingsIcon />
          </IconButton>
          <IconButton color="inherit" component={Link} to={'/about'}>
            <AboutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </div>
  );
};

const AppRouter = (): JSX.Element => {
  const classes = useAppStyles();
  return (
    <BrowserRouter>
      <Nav />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Switch>
          <Route path="/presets">
            <span>Presets</span>
          </Route>
          <Route path="/control">
            <span>Manual Control</span>
          </Route>
          <Route path="/settings">
            <span>Settings</span>
          </Route>
          <Route path="/about">
            <span>About</span>
          </Route>
          <Route path="/">
            <MapPage />
          </Route>
        </Switch>
      </main>
    </BrowserRouter>
  );
};

export default AppRouter;
