import React, {Component} from 'react'
import {connect} from 'react-redux'
import {HashRouter as Router, Link, Redirect} from 'react-router-dom'
import {Provider} from 'react-redux'
import {
    Drawer,
    List,
    ListItem,
    ListItemText
} from '@material-ui/core';
import {
    blue
} from '@material-ui/core/colors';

import {
    MuiThemeProvider,
    createMuiTheme,
    withStyles
} from '@material-ui/core/styles';

import {
    GameSelect
} from 'components';

import {fetchGames, selectGame, resetGame} from './../modules/app.modules.js';

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
        height: 'calc(100vh - 48px)'
    },
    root: {
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        height: '100vh',
        flexWrap: 'wrap'
    },
    content: {
        display: 'flex',
        flex: 1,
        flexGrow: 1,
        padding: theme.spacing.unit * 2,
        backgroundColor: theme.palette.background.default,
        minWidth: 150,
        overflow: 'auto',
        height: 'calc(100% - 48px)'
    },
    toolbar: theme.mixins.toolbar,
});

class AppContainer extends Component {

    componentDidMount() {
        this.props.fetchGames();
    }

    _onSelectGame = event => {
        this.props.selectGame(event.target.value);
    };

    render() {
        const {routes, store, classes, games, game} = this.props;
        return (
            <MuiThemeProvider theme={theme}>
                <Provider store={store}>
                    <Router>
                        <div className={classes.root}>
                            <BokeAppBar
                                title={game}
                                onClick={this.props.resetGame}
                            />
                            {
                                game !== null &&
                                <Drawer
                                    open={false}
                                    variant="permanent"
                                    classes={{
                                        paper: classes.drawerPaper,
                                    }}
                                >
                                    <GameSelect
                                        games={games}
                                        value={game.originalName}
                                        onChange={this._onSelectGame}
                                    />
                                    <List>
                                        <ListItem button component={Link} to="/gameHistory">
                                            <ListItemText primary='기록통계'/>
                                        </ListItem>
                                        <ListItem button component={Link} to="/recordGame">
                                            <ListItemText primary='기록입력'/>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText primary='이번의 상 현황'/>
                                        </ListItem>
                                        <ListItem button component={Link} to="/registryUser">
                                            <ListItemText primary='사용자 등록'/>
                                        </ListItem>
                                        <ListItem button component={Link} to="/registryGame">
                                            <ListItemText primary='게임 등록'/>
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemText primary='후원입력'/>
                                        </ListItem>
                                    </List>
                                </Drawer>
                            }
                            <div className={classes.content}>
                                {
                                    game === null && location.hash !== '#/' ? <Redirect to="/"/> : routes
                                }
                            </div>

                        </div>
                    </Router>
                </Provider>
            </MuiThemeProvider>

        )
    }
}

const appContainer = withStyles(styles)(AppContainer);
export default connect(state => (
        {
            games: state.app.games,
            game: state.app.game
        }
    )
    , {fetchGames, selectGame, resetGame})(appContainer)
