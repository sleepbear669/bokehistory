import React, {PureComponent} from 'react';
import './RegistryUser.scss';
import {
    TextField,
    Button
} from '@material-ui/core';

export default class RegistryUser extends PureComponent {

    componentWillUnmount() {
    }

    componentDidMount() {
    }

    render() {
        return (
            <section className="game-history">
                <p>
                    <span>[주의]</span>
                    <span>닉네임은 한번 정하면 원칙적으로 변경이 불가능 합니다.</span>
                    <span>또한 1인 1아이디 원칙이며 재생성이 불가능 합니다.</span>
                    <span>충분히 생각해 보시고 입력하시기 바랍니다.</span>
                </p>
                <TextField autoFocus
                           label='아이디'
                />
                <br/>
                <Button variant="contained"
                        color="primary"
                >
                    등록하기
                </Button>
            </section>

        )
    }
}

