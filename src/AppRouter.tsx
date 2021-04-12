import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  useLocation,
} from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AboutIcon from '@material-ui/icons/Info';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import React from 'react';
import {
  Settings as SettingsIcon,
  Map as MapIcon,
  VideogameAsset as ManualControlIcon,
  Beenhere as PresetsIcon,
} from '@material-ui/icons';
import MapPage from './map';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@material-ui/core';

const drawerWidth = 240;

const useAppStyles = makeStyles((theme) => ({
  content: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    [theme.breakpoints.up('sm')]: {
      width: `calc(100vw - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
}));

const useNavStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
}));

const useIntensityStyles = makeStyles((theme) => ({
  formControl: {
    flex: 1,
    margin: theme.spacing(1),
  },
}));

const IntensitySelect = (props: { label: string }): JSX.Element => {
  const { label } = props;
  const classes = useIntensityStyles();
  const [intensity, setIntensity] = React.useState('high');

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setIntensity(event.target.value as string);
  };

  return (
    <FormControl className={classes.formControl}>
      <InputLabel id={`intensity-select-label-${label}`}>{label}</InputLabel>
      <Select
        labelId={`intensity-select-label-${label}`}
        id={`intensity-select-${label}`}
        value={intensity}
        onChange={handleChange}
      >
        <MenuItem value={'low'}>Low</MenuItem>
        <MenuItem value={'medium'}>Medium</MenuItem>
        <MenuItem value={'high'}>High</MenuItem>
        <MenuItem value={'max'}>Max</MenuItem>
      </Select>
    </FormControl>
  );
};

const Nav = (): JSX.Element => {
  const classes = useNavStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close when location changes
  const location = useLocation();
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const pageTitle = React.useMemo(() => {
    switch (location.pathname) {
      case '/about':
        return 'About';
      case '/map':
        return 'Map';
      case '/settings':
        return 'Settings';
      default:
        return 'Valetudo';
    }
  }, [location.pathname]);

  const handleClose = React.useCallback(() => {
    setMobileOpen(false);
  }, []);
  const handleOpen = React.useCallback(() => {
    setMobileOpen(true);
  }, []);

  const drawer = React.useMemo(
    () => (
      <div>
        <Box
          mx={2}
          alignItems="center"
          display="flex"
          className={classes.toolbar}
        >
          <Typography>Currently: cleaning</Typography>
        </Box>
        <Divider />
        <Box
          mx={2}
          mt={2}
          mb={1}
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
        >
          <Chip color="primary" label="Dust" />
          <Chip color="primary" label="Water" />
          <Chip color="primary" label="Mop" disabled />
        </Box>
        <Box m={1} display="flex" flexDirection="row">
          <IntensitySelect label="Fan Speed" />
          <IntensitySelect label="Water Grade" />
        </Box>
        <Divider />
        <List>
          <ListItem button component={Link} to="/">
            <ListItemIcon>
              <MapIcon />
            </ListItemIcon>
            <ListItemText primary="Map" />
          </ListItem>
          <ListItem button component={Link} to="/manual">
            <ListItemIcon>
              <ManualControlIcon />
            </ListItemIcon>
            <ListItemText primary="Manual Control" />
          </ListItem>
          <ListItem button component={Link} to="/presets">
            <ListItemIcon>
              <PresetsIcon />
            </ListItemIcon>
            <ListItemText primary="Presets" />
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem button component={Link} to="/settings">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <ListItem button component={Link} to="/about">
            <ListItemIcon>
              <AboutIcon />
            </ListItemIcon>
            <ListItemText primary="About" />
          </ListItem>
        </List>
      </div>
    ),
    [classes.toolbar]
  );

  return (
    <div className={classes.root}>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleOpen}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {pageTitle}
          </Typography>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Hidden smUp>
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleClose}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown>
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
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
          <Route path="/manual">
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
