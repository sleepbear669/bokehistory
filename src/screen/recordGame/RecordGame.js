import './RecordGame.scss';

import produce from "immer";
import React, {PureComponent} from 'react';
import {sortBy} from 'lodash';

import {GameSelect} from 'components';
import NormalRecord from './components/NormalRecord';
import ClanRecord from './components/ClanRecord';

const players = {
    1: {
        name: '',
        score: 0
    },
    2: {
        name: '',
        score: 0
    },
    3: {
        name: '',
        score: 0
    },
    4: {
        name: '',
        score: 0
    }
};

export default class RecordGame extends PureComponent {
    state = {
        game: this.props.game,
        players,
        playerCount: Object.keys(players).length

    };

    componentDidMount() {
        this.props.fetchUser();
    }

    onProduce = (producer) => {
        this.setState(produce(this.state, producer));
    };

    _onSelectGame = event => {
        this.onProduce(draft => {
            draft.game = event.target.value;
        });
    };

    _onSaveRecord = (players) => {

        const gameRecord = {
            game: this.state.game.originalName,
            players,
            gameResult: sortBy(Object.values(players), (obj) => parseInt(obj.score)).reverse()
                .map((r, i) => ({...r, rank: i + 1}))
        };
        this.props.requestSaveRecord(gameRecord)
            .then(_ => {
                alert('저장 완료');
                this.props.selectGame(this.state.game);
            })
    };
    _generateRecord = (game) => {
        const {users} = this.props;
        if (game.clan) {
            return <ClanRecord
                game={game}
                clans={game.clans}
                bid={game.bid}
                users={users}
                onSave={this._onSaveRecord}
            />
        }
        return <NormalRecord
            game={game}
            users={users}
            onSave={this._onSaveRecord}
        />
    };

    render() {
        const {games} = this.props;

        return (
            <section className="recode-game">
                <GameSelect
                    games={games}
                    value={this.state.game.originalName}
                    onChange={this._onSelectGame}
                />
                {
                    this.state.game && this._generateRecord(this.state.game)
                }
            </section>
        )
    }
};
