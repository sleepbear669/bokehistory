import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import produce from "immer";
import {Button, IconButton, Input} from "@material-ui/core";

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

class NormalRecord extends PureComponent {
    state = {
        players,
        playerCount: Object.keys(players).length

    };

    onProduce = (producer) => {
        this.setState(produce(this.state, producer));
    };

    _inputPlayerRecord = (order, field) => {
        return event => {
            this.onProduce(draft => {
                draft.players[order][field] = event.target.value;

            });
        };
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

    _onSave = () => {
        this.props.onSave(this.state.players);
    };

    render() {
        const {} = this.props;

        return (
            <section className="recode-game">
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
                        onClick={this._onSave}
                >
                    기록
                </Button>
            </section>
        )
    }
};

NormalRecord.propTypes = {
    onSave: PropTypes.func
};

export default NormalRecord;
