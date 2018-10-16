import React, {Component} from 'react'
import {connect} from 'react-redux'
import {HashRouter as Router, Link} from 'react-router-dom'
import {Provider} from 'react-redux'
import {
    AppBar,
    Typography,
    Drawer,
    Divider,
    List,
    ListItem,
    ListItemText, Select, MenuItem
} from '@material-ui/core';
import {
    blue
} from '@material-ui/core/colors';
import {
    MuiThemeProvider,
    createMuiTheme,
    withStyles
} from '@material-ui/core/styles';

import BokeAppBar from './BokeAppBar';

const theme = createMuiTheme({
    palette: {
        primary: blue
    },
});

const styles = theme => ({
    appBar: {
        height: 48,
        zIndex: theme.zIndex.drawer + 1,
    },
    drawerPaper: {
        position: 'relative',
    },
    root: {
        paddingTop: 48,
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        minWidth: 0, // So the Typography noWrap works
    },
    toolbar: theme.mixins.toolbar,
});

class AppContainer extends Component {
    componentDidMount() {
    }

    render() {
        const {routes, store, classes, navigation} = this.props;

        return (
            <MuiThemeProvider theme={theme}>
                <Provider store={store}>
                    <Router>
                        <div className={classes.root}>
                            <BokeAppBar></BokeAppBar>
                            <Drawer
                                variant="permanent"
                                classes={{
                                    paper: classes.drawerPaper,
                                }}
                            >
                                <Select>
                                    <MenuItem value=""><em>None</em>
                                    </MenuItem>
                                    <MenuItem value={10}>마백마작</MenuItem>
                                    <MenuItem value={20}>리치마작</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>
                                <List>
                                    <ListItem button>
                                        <ListItemText primary='리치 마작'/>
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemText primary='마백마작'/>
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemText primary='기록검색'/>
                                    </ListItem>
                                    <ListItem button>
                                        <ListItemText primary='후원입력'/>
                                    </ListItem>
                                    <ListItem button component="a" href="#simple-list">
                                        <ListItemText  primary='이번의 상 현황'/>
                                    </ListItem>
                                    <ListItem button component={Link} to="/registryUser">
                                        <ListItemText primary='사용자 등록'/>
                                    </ListItem>
                                    <ListItem button component={Link} to="/registryGame">
                                        <ListItemText primary='게임 등록'/>
                                    </ListItem>
                                </List>
                            </Drawer>
                            <div className={classes.content}>
                                {routes}
                            </div>

                        </div>
                    </Router>
                </Provider>
            </MuiThemeProvider>

        )
    }
}

const appContainer = withStyles(styles)(AppContainer);
export default connect(state => ({}), {})(appContainer)
