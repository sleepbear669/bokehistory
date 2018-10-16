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

    componentWillUnmount() {
    }

    componentDidMount() {
    }

    _handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    _submit = () => {
        this.props.addUser(this.state.name)
            .then(() => {
                alert(`${this.state.name} 등록 완료`);
                this.setState({name: '', error: false});
                // this.props.history.push('/');
            })
            .catch(e => this.setState({error: true}));
    };

    render() {
        return (
            <section className="game-history">
                <p className={'warning'}>
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

