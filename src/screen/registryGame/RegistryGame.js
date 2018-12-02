import React, {PureComponent} from 'react';
import './RegistryGame.scss';
import {
    TextField,
    Button,
    FormLabel
} from '@material-ui/core';

export default class RegistryGame extends PureComponent {
    state = {
        name: '',
        error: false
    };

    _handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    _submit = () => {
        this.props.addGame(this.state.name)
            .then(() => {
                alert(`${this.state.name} 등록 완료`);
                this.setState({name: '', error: false});
            })
            .catch(e => this.setState({error: true}));
    };

    render() {
        return (
            <section className="game-history">
                <p className={'warning'}>
                    <span>실수로 등록한 경우 관리자에게 말해주세요.</span>
                </p>
                <TextField autoFocus
                           label='게임 이름'
                           value={this.state.name}
                           onChange={this._handleChange('name')}
                           error={this.state.error}
                />
                <br/>
                {
                    this.state.error &&
                    <FormLabel error={this.state.error}>등록된 게임입니다.</FormLabel>
                }
                <br/>
                <Button className={'submit-btn'}
                        variant="contained"
                        color="primary"
                        onClick={this._submit}
                >
                    등록하기
                </Button>
            </section>

        );
    }
}

