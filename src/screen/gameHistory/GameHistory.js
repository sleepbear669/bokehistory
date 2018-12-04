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

let counter = 0;

function createData(name, calories, fat, carbs, protein) {
    counter += 1;
    return {id: counter, name, calories, fat, carbs, protein};
}

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

const rows = [
    {id: 'name', numeric: false, disablePadding: true, label: 'Dessert (100g serving)'},
    {id: 'calories', numeric: true, disablePadding: false, label: 'Calories'},
    {id: 'fat', numeric: true, disablePadding: false, label: 'Fat (g)'},
    {id: 'carbs', numeric: true, disablePadding: false, label: 'Carbs (g)'},
    {id: 'protein', numeric: true, disablePadding: false, label: 'Protein (g)'},
];

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
                    {historyRows.map(row => {
                        return (
                            <TableCell
                                key={row.name}
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
    table: {
        minWidth: 1020,
    },
    tableWrapper: {
        overflowX: 'auto',
    },
});

class GameHistory extends React.Component {
    state = {
        order: 'desc',
        orderBy: 'average',
        data: [
            createData('Cupcake', 305, 3.7, 67, 4.3),
            createData('Donut', 452, 25.0, 51, 4.9),
            createData('Eclair', 262, 16.0, 24, 6.0),
            createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
            createData('Gingerbread', 356, 16.0, 49, 3.9),
            createData('Honeycomb', 408, 3.2, 87, 6.5),
            createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
            createData('Jelly Bean', 375, 0.0, 94, 0.0),
            createData('KitKat', 518, 26.0, 65, 7.0),
            createData('Lollipop', 392, 0.2, 98, 0.0),
            createData('Marshmallow', 318, 0, 81, 2.0),
            createData('Nougat', 360, 19.0, 9, 37.0),
            createData('Oreo', 437, 18.0, 63, 4.0),
        ]
    };

    componentDidMount() {
        this.props.fetchRecord(this.props.game);
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
        const {data, order, orderBy} = this.state;
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
        console.log(gameData);

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
                                            key={n.id}
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
