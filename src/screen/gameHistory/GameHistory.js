import React, {PureComponent} from 'react';
import './GameHistory.scss';
import {
    Card,
    CardContent,
    Typography
} from '@material-ui/core';

export default class GameHistory extends PureComponent {

    componentWillUnmount() {
    }

    componentDidMount() {
        this.props.fetchRecord();
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
        return (
            <section className="game-history">
                <div className="history-container">
                    {
                        records.map(record => this.generateRecordCard(record))
                    }
                </div>

            </section>
        );
    }
};
