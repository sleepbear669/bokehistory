import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import NormalHistory from './components/NormalHistory';
import MahjongHistory from './components/MahjongHistory';

const styles = theme => ({
    root: {
        width: '100%',
    },
    tableWrapper: {
        overflowX: 'auto',
    },
});

class GameHistory extends React.Component {

    componentDidMount() {
        this.props.fetchRecord(this.props.game.originalName);
    }

    componentDidUpdate(prevProps, prevState, snapshots) {
        if (this.props.game !== prevProps.game) {
            this.props.fetchRecord(this.props.game.originalName);
        }
    }

    _calculateGameResult = () => {
        const {ratings, gameResult, game} = this.props;
        const result = gameResult.reduce((a, b) => {
            if (!a.hasOwnProperty(b.name)) {
                a[b.name] = [];
            }
            a[b.name].push(b);
            return a;
        }, {});
        if (game.type === 'mahjong') {
            return Object.keys(result)
                .map(k => {
                    const playerHistory = result[k];
                    const score = playerHistory.reduce((a, b) => {
                        let rankWeight = 0;
                        if (b.rank === 1) rankWeight = 20;
                        if (b.rank === 1) rankWeight = 10;
                        if (b.rank === 1) rankWeight = -10;
                        if (b.rank === 1) rankWeight = -20;
                        return a + (b.score / 1000 + rankWeight);
                    }, 0);
                    return {
                        name: k,
                        score,
                        scorePercent: (score / playerHistory.length) * 100,
                        winRate: (playerHistory.filter(r => r.rank === 1).length / playerHistory.length) * 100,
                        first: playerHistory.filter(r => r.rank === 1).length,
                        second: playerHistory.filter(r => r.rank === 2).length,
                        third: playerHistory.filter(r => r.rank === 3).length,
                        fourth: playerHistory.filter(r => r.rank === 4).length,
                        playCount: playerHistory.length,
                    }
                });

        } else {
            return Object.keys(result)
                .map(k => {
                    const playerHistory = result[k];
                    const rating = ratings.find(r => r.name === k);
                    return {
                        name: k,
                        rating: rating ? rating.rating : 1000,
                        average: (playerHistory.reduce((a, b) => a + parseInt(b.score), 0) / playerHistory.length),
                        winRate: (playerHistory.filter(r => r.rank === 1).length / playerHistory.length) * 100,
                        playCount: playerHistory.length,
                    }
                });
        }
    };

    _generateHistoryTable = () => {
        const {gameResult, game} = this.props;
        if (game.type === 'mahjong') {
            return <MahjongHistory gameResult={this._calculateGameResult()}/>;
        } else {
            return <NormalHistory gameResult={this._calculateGameResult()}/>;
        }
    };

    render() {
        const {classes} = this.props;
        return (
            <Paper className={classes.root}>
                {
                    this._generateHistoryTable()
                }
            </Paper>
        );
    }
}

GameHistory.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GameHistory);
