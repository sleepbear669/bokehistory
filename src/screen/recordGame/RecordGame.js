import './RecordGame.scss';

import React, {PureComponent} from 'react';

import {
    TextField,
    Button,
    FormLabel,
    Input
} from '@material-ui/core';


export default class RecordGame extends PureComponent {

    componentWillUnmount() {
    }

    componentDidMount() {
    }

    render() {
        return (
            <section className="recode-game">
                <div className="score-record-box">
                    <Input placeholder='순서'/>
                    <Input placeholder='닉네임'/>
                    <Input placeholder='점수'/>
                </div>
                <div className="score-record-box">
                    <Input placeholder='순서'/>
                    <Input placeholder='닉네임'/>
                    <Input placeholder='점수'/>
                </div>
                <div className="score-record-box">
                    <Input placeholder='순서'/>
                    <Input placeholder='닉네임'/>
                    <Input placeholder='점수'/>
                </div>
                <div className="score-record-box">
                    <Input placeholder='순서'/>
                    <Input placeholder='닉네임'/>
                    <Input placeholder='점수'/>
                </div>
                <Button variant="contained"
                        color="primary"
                >
                    기록
                </Button>
            </section>
        )
    }
};
