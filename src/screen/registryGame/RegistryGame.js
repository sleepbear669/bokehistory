import React, {PureComponent} from 'react';
import './RegistryGame.scss';
import {
    TextField,
    Button,
    Input,
    FormLabel,
    FormControl
} from '@material-ui/core';

const styles = {
    input: {
        display: 'none',
    },
    textField: {
        margin: 5
    },
    personForm: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    personInput: {
        width: 30,

    }
};

export default class RegistryGame extends PureComponent {
    state = {
        name: '',
        originalName: '',
        min: 2,
        max: 4,
        thumbnail: null,
        error: false
    };

    _handleChange = name => event => {
        this.setState({
            [name]: event.target.value,
        });
    };

    _uploadFile = e => {
        this.setState({thumbnail: e.target.files[0]});
    };

    _submit = () => {
        const {name, originalName, min, max, thumbnail} = this.state;
        this.props.addGame({name, originalName, min, max}, thumbnail)
            .then(() => {
                alert(`${this.state.name} 등록 완료`);
                this.setState({name: '', error: false});
            })
            .catch(e => {
                console.log(e);
                this.setState({error: true})
            });
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
                           style={styles.textField}
                />
                <br/>

                <TextField label='영문 이름'
                           value={this.state.originalName}
                           onChange={this._handleChange('originalName')}
                           style={styles.textField}
                />
                <br/>
                <FormControl style={styles.personForm}>
                    게임 인원 :
                    <Input type={'number'}
                           value={this.state.min}
                           onChange={this._handleChange('min')}
                           style={styles.personInput}
                           input={{textAlign: 'center'}}
                    />
                    ~
                    <Input type={'number'}
                           value={this.state.max}
                           onChange={this._handleChange('max')}
                           style={styles.personInput}
                    />
                </FormControl>

                <br/>
                <input
                    accept="image/*"
                    style={styles.input}
                    id="contained-button-file"
                    onChange={this._uploadFile}
                    multiple
                    type="file"
                />
                <label htmlFor="contained-button-file">
                    <Button variant="contained" component="span">
                        Upload
                    </Button>
                    {this.state.thumbnail && this.state.thumbnail.name}
                </label>

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

