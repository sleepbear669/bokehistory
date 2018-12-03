import './RecordGame.scss';

import produce from "immer";
import React, {PureComponent} from 'react';
import {sortBy} from 'lodash';
import {Button, IconButton, Input,} from '@material-ui/core';

import {GameSelect} from 'components';
import NormalRecord from './components/NormalRecord';
import {fetchUser} from "./RecordGame.modules";

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
        if (this.state.game === '')
            return alert('게임을 선택해주세요.');

        const gameRecord = {
                game: this.state.game,
                players,
                gameResult: sortBy(Object.values(players), (obj) => parseInt(obj.score)).reverse()
            }
        ;
        this.props.requestSaveRecord(gameRecord)
            .then(_ => {
                alert('저장 완료');
                this.props.selectGame(this.state.game);
            })
    };

    render() {
        const {games, users} = this.props;
        return (
            <section className="recode-game">
                <GameSelect
                    games={games}
                    value={this.state.game}
                    onChange={this._onSelectGame}
                />
                <NormalRecord
                    users={users}
                    onSave={this._onSaveRecord}
                />
            </section>
        )
    }
};
