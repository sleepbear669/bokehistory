import React, {PureComponent} from 'react';
import './GameHistory.scss';
import {
    Card,
    CardContent,
    Typography,
    Table, TableBody, TableCell, TableHead, TableRow, Paper
} from '@material-ui/core';

export default class GameHistory extends PureComponent {

    componentWillUnmount() {
    }

    componentDidMount() {
        this.props.fetchRecord(this.props.game);
    }

    componentDidUpdate(prevProps, prevState, snapshots) {
        if (this.props.game !== prevProps.game) {
            this.props.fetchRecord(this.props.game);
        }
    }

    generateRecordCard = (record) => {
        const players = record.players;
        const playerList = Object.keys(players)
            .map(order => ({
                ...players[order],
                order
            }));
        playerList.sort((a, b) => {
            return a.score - b.score;
        });
        return <Card key={Math.random()}
                     className={'history-card'}
        >
            <CardContent>
                <Typography variant="h5" component="h2">
                    {record.game}
                </Typography>
                {
                    playerList.map(player => {
                        return <div key={player.order}>
                            이름 : <span>{player.name}</span>
                            순서 : <span>{player.order}</span>
                            점수 : <span>{player.score}</span>
                        </div>
                    })
                }
                <div>
                </div>
            </CardContent>
        </Card>
    };

    render() {
        const {records} = this.props;
        console.log(records);
        return (
            <Paper className="game-history">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>순위</TableCell>
                            <TableCell numeric>이름</TableCell>
                            <TableCell numeric>승률</TableCell>
                            <TableCell numeric>게임수</TableCell>
                            <TableCell numeric>평균 점수</TableCell>
                        </TableRow>
                    </TableHead>
                    {/*<TableBody>*/}
                    {/*{rows.map(row => {*/}
                    {/*return (*/}
                    {/*<TableRow key={row.id}>*/}
                    {/*<TableCell component="th" scope="row">*/}
                    {/*{row.name}*/}
                    {/*</TableCell>*/}
                    {/*<TableCell numeric>{row.calories}</TableCell>*/}
                    {/*<TableCell numeric>{row.fat}</TableCell>*/}
                    {/*<TableCell numeric>{row.carbs}</TableCell>*/}
                    {/*<TableCell numeric>{row.protein}</TableCell>*/}
                    {/*</TableRow>*/}
                    {/*);*/}
                    {/*})}*/}
                    {/*</TableBody>*/}
                </Table>
                <div className="history-container">
                    {
                        records.map(record => this.generateRecordCard(record))
                    }
                </div>

            </Paper>
        );
    }
};
