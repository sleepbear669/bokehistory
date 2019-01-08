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
    {id: 'score', numeric: true, disablePadding: false, label: '승점'},
    {id: 'scorePercent', numeric: true, disablePadding: false, label: '승점%'},
    {id: 'winRate', numeric: true, disablePadding: false, label: '승%'},
    {id: 'first', numeric: true, disablePadding: false, label: '승'},
    {id: 'second', numeric: true, disablePadding: false, label: '2'},
    {id: 'third', numeric: true, disablePadding: false, label: '3'},
    {id: 'fourth', numeric: true, disablePadding: false, label: '4'},
    {id: 'playCount', numeric: true, disablePadding: false, label: '국수'},
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
                    <TableCell padding='checkbox'>순위</TableCell>
                    <TableCell padding='dense'>이름</TableCell>
                    {historyRows.map((row, i) => {
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
    },
    tableWrapper: {
        overflowX: 'auto',
    },
});

class GameHistory extends React.Component {
    state = {
        order: 'desc',
        orderBy: 'score'
    };

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({order, orderBy});
    };

    render() {
        const {classes, gameResult} = this.props;
        const {order, orderBy} = this.state;
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
                            {stableSort(gameResult, getSorting(order, orderBy))
                                .map((n, i) => {
                                    return (
                                        <TableRow
                                            hover
                                            key={i}
                                        >
                                            <TableCell component="th" padding="none" style={{textAlign: 'center'}}>
                                                {i + 1}
                                            </TableCell>
                                            <TableCell component="th" padding="none">
                                                {n.name}
                                            </TableCell>
                                            <TableCell numeric>{n.score.toFixed(2)}</TableCell>
                                            <TableCell numeric>{n.scorePercent.toFixed(2)}</TableCell>
                                            <TableCell numeric>{n.winRate.toFixed(2)}%</TableCell>
                                            <TableCell numeric>{n.first}</TableCell>
                                            <TableCell numeric>{n.second}</TableCell>
                                            <TableCell numeric>{n.third}</TableCell>
                                            <TableCell numeric>{n.fourth}</TableCell>
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
