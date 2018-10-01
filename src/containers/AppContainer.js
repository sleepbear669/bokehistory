import React, {Component} from 'react'
import {connect} from 'react-redux'
import {BrowserRouter as Router} from 'react-router-dom'
import {Provider} from 'react-redux'
import {
    AppBar,
    Typography,
    Drawer,
    Divider,
    List
} from '@material-ui/core';
import {
    blue
} from '@material-ui/core/colors';
import {
    MuiThemeProvider,
    createMuiTheme,
    withStyles
} from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        primary: blue
    },
});

const styles = theme => ({
    appBar: {
        padding: 6,
        zIndex: theme.zIndex.drawer + 1,
    },
    drawerPaper: {
        position: 'relative',
        width: 120
    },
    root: {
        flexGrow: 1,
        height: 440,
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
        const {routes, store, classes} = this.props;

        return (
            <MuiThemeProvider theme={theme}>
                <Provider store={store}>
                    <Router>
                        <div className={classes.root}>
                            <AppBar position="absolute"
                                    color="primary"
                                    className={classes.appBar}>
                                <Typography variant="title" color="inherit">
                                    보드케이브
                                </Typography>
                            </AppBar>
                            <Drawer
                                variant="permanent"
                                classes={{
                                    paper: classes.drawerPaper,
                                }}
                            >
                                <Divider/>
                                <List>리치 마작</List>
                                <Divider/>
                                <List>마백마작</List>
                            </Drawer>
                            <div className={classes.content}>
                                <div className={classes.toolbar} />
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
