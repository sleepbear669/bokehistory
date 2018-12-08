import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import produce from "immer";
import {
    MenuItem,
    Paper,
    Input,
    Select,
    Button,
    IconButton,
    TextField,
    FormControl,
    InputLabel
} from "@material-ui/core";
import {withStyles} from '@material-ui/core/styles';
import {Link} from "react-router-dom";

const styles = theme => ({
    button: {
        margin: theme.spacing.unit,
    },
    paper: {
        padding: theme.spacing.unit,
        margin: theme.spacing.unit
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        minWidth: 100,
        maxWidth: 200,
    }
});


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

    _renderSelector = (order, title, data, type) => {
        return <FormControl className={this.props.classes.textField}>
            <InputLabel>{title}</InputLabel>
            <Select
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
        const {users, classes} = this.props;

        return (
            <section className="recode-game">
                {
                    Object.keys(this.state.players)
                        .map(order => {
                            return (
                                <Paper className={classes.paper}
                                       key={order}
                                >
                                    <div>{order}</div>
                                    {
                                        this._renderSelector(order, '이름', users, 'name')

                                    }
                                    <TextField className={classes.textField}
                                               label={'점수'}
                                               onChange={this._inputPlayerRecord(order, 'score')}
                                               type={'number'}
                                    />
                                </Paper>
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
                <Button className={classes.button}
                        variant="contained"
                        color="primary"
                        onClick={this._onSave}
                >
                    기록
                </Button>
                <Button variant="contained"
                        component={Link} to="/recordGame" color="primary"
                        onClick={() => this.props.selectGame(game.originalName)}>
                    취소
                </Button>
            </section>
        )
    }
}

NormalRecord.propTypes = {
    onSave: PropTypes.func
};

export default withStyles(styles)(NormalRecord);
