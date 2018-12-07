import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import produce from "immer";
import {MenuItem, Input, Select, FormControl, InputLabel, Button, IconButton} from "@material-ui/core";

const players = {
    1: {
        name: '',
        clan: '',
        score: 0
    },
    2: {
        name: '',
        clan: '',
        score: 0
    },
    3: {
        name: '',
        clan: '',
        score: 0
    },
    4: {
        name: '',
        clan: '',
        score: 0
    }
};

class ClanRecord extends PureComponent {
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

    _renderSelect = (order, title, data, type) => {
        return <FormControl>
            <InputLabel>{title}</InputLabel>
            <Select
                style={{minWidth: 150}}
                value={this.state.players[order][type]}
                onChange={this._inputPlayerRecord(order, type)}
            >
                {
                    data.map(d => {
                        return <MenuItem value={d.name}
                                         key={d.name}>{d.name}</MenuItem>
                    })
                }
            </Select>
        </FormControl>
    };

    render() {
        const {users, clans} = this.props;

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
                                    {
                                        this._renderSelect(order, '이름', users, 'name')
                                    }
                                    {
                                        this._renderSelect(order, '종족', clans, 'clan')
                                    }
                                    <FormControl>
                                        <InputLabel>점수</InputLabel>
                                        <Input className='record-input'
                                               onChange={this._inputPlayerRecord(order, 'score')}
                                               type={'number'}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <InputLabel>점수</InputLabel>
                                        <Input className='record-input'
                                               onChange={this._inputPlayerRecord(order, 'score')}
                                               type={'number'}
                                        />
                                    </FormControl>
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
}

ClanRecord.propTypes = {
    onSave: PropTypes.func,
    clans: PropTypes.array.isRequired,
    bid: PropTypes.bool
};

export default ClanRecord;
