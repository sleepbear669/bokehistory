import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';

function desc(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function stableSort(array, cmp) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = cmp(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
    return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

const historyRows = [
    {id: 'average', numeric: true, disablePadding: false, label: '평균'},
    {id: 'winRate', numeric: true, disablePadding: false, label: '승률'},
    {id: 'playCount', numeric: true, disablePadding: false, label: '게임수'},
];


class EnhancedTableHead extends React.Component {
    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {
        const {order, orderBy} = this.props;

        return (
            <TableHead>
                <TableRow>
                    <TableCell padding='none'>순위</TableCell>
                    <TableCell padding='none'>이름</TableCell>
                    {historyRows.map((row,i) => {
                        return (
                            <TableCell
                                key={i}
                                numeric={row.numeric}
                                padding={row.disablePadding ? 'none' : 'default'}
                                sortDirection={orderBy === row.id ? order : false}
                            >
                                <TableSortLabel
                                    active={orderBy === row.id}
                                    direction={order}
                                    onClick={this.createSortHandler(row.id)}
                                >
                                    {row.label}
                                </TableSortLabel>
                            </TableCell>
                        );
                    }, this)}
                </TableRow>
            </TableHead>
        );
    }
}

EnhancedTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
};

const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
    },
    tableWrapper: {
        overflowX: 'auto',
    },
});

class GameHistory extends React.Component {
    state = {
        order: 'desc',
        orderBy: 'average'
    };

    componentDidMount() {
        this.props.fetchRecord(this.props.game.originalName);
    }

    componentDidUpdate(prevProps, prevState, snapshots) {
        if (this.props.game !== prevProps.game) {
            this.props.fetchRecord(this.props.game);
        }
    }

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({order, orderBy});
    };

    render() {
        const {classes} = this.props;
        const {order, orderBy} = this.state;
        let gameData = [];
        if (this.props.gameResult !== null) {
            gameData = Object.keys(this.props.gameResult)
                .map(k => {
                    const playerHistory = this.props.gameResult[k];
                    return {
                        name: k,
                        average: (playerHistory.reduce((a, b) => a + parseInt(b.score), 0) / playerHistory.length),
                        winRate: (playerHistory.filter(r => r.rank === 1).length / playerHistory.length) * 100,
                        playCount: playerHistory.length,
                    }
                })
        }

        return (
            <Paper className={classes.root}>
                <div className={classes.tableWrapper}>
                    <Table className={classes.table} aria-labelledby="tableTitle">
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={this.handleRequestSort}
                        />
                        <TableBody>
                            {stableSort(gameData, getSorting(order, orderBy))
                                .map((n, i) => {
                                    return (
                                        <TableRow
                                            hover
                                            key={i}
                                        >
                                            <TableCell component="th" scope="row" padding="none">
                                                {i + 1}
                                            </TableCell>
                                            <TableCell component="th" scope="row" padding="none">
                                                {n.name}
                                            </TableCell>
                                            <TableCell numeric>{n.average}</TableCell>
                                            <TableCell numeric>{n.winRate}</TableCell>
                                            <TableCell numeric>{n.playCount}</TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </div>
            </Paper>
        );
    }
}

GameHistory.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GameHistory);
