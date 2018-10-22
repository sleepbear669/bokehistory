import './RecordGame.scss';

import produce from "immer";
import React, {PureComponent} from 'react';

import {Button, IconButton, Input,} from '@material-ui/core';

import {GameSelect} from 'components';

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
        game: 'all',
        players,
        playerCount: Object.keys(players).length

    };

    onProduce = (producer) => {
        this.setState(produce(this.state, producer));
    };

    _onSelectGame = event => {
        this.onProduce(draft => {
            draft.game = event.target.value;
        });
    };

    _inputPlayerRecord = (order, field) => {
        return event => {
            this.onProduce(draft => {
                draft.players[order][field] = event.target.value;

            });
        };
    };

    _onSaveRecord = () => {
        this.props.requestSaveRecord({
            game: this.state.game,
            players: this.state.players
        })
            .then( _ => alert('저장 완료'))
    };

    _addPlayer = () => {
        this.onProduce(draft => {
            draft.playerCount = this.state.playerCount + 1;
            draft.players[draft.playerCount] = {
                name: '',
                score: 0
            }
        });
    };

    _removePlayer = () => {
        this.onProduce(draft => {
            delete draft.players[draft.playerCount];
            draft.playerCount = this.state.playerCount - 1;
        });
    };

    render() {
        const {games} = this.props;

        return (
            <section className="recode-game">
                <GameSelect
                    games={games}
                    value={this.state.game}
                    onChange={this._onSelectGame}
                />
                {
                    Object.keys(this.state.players)
                        .map(order => {
                            return (
                                <div className="score-record-box"
                                     key={order}
                                >
                                    <span>{order}</span>
                                    <Input className='record-input' placeholder='닉네임'
                                           onChange={this._inputPlayerRecord(order, 'name')}
                                    />
                                    <Input className='record-input' placeholder='점수'
                                           onChange={this._inputPlayerRecord(order, 'score')}
                                           type={'number'}
                                    />
                                </div>
                            )
                        })
                }
                <IconButton onClick={this._addPlayer}>
                    <i className={'mdi mdi-plus'}/>
                </IconButton>
                <IconButton onClick={this._removePlayer}
                            disabled={this.state.playerCount <= 1}
                >
                    <i className={'mdi mdi-minus'}/>
                </IconButton>
                <br/>
                <Button variant="contained"
                        color="primary"
                        onClick={this._onSaveRecord}
                >
                    기록
                </Button>
            </section>
        )
    }
};
