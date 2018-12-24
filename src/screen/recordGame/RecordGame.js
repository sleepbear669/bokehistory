import './RecordGame.scss';

import produce from "immer";
import React, {PureComponent} from 'react';
import {sortBy} from 'lodash';

import {GameSelect} from 'components';
import NormalRecord from './components/NormalRecord';
import ClanRecord from './components/ClanRecord';
import MahjongRecord from './components/MahjongRecord';

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

const elo_k = 16;

function elo(a, b, rank, k = elo_k) {
    const winRate = 1.0 / (1.0 + Math.pow(10, (b - a) / 400));
    return parseInt(k * (rank - winRate));
}

export default class RecordGame extends PureComponent {
    state = {
        game: this.props.game,
        players,
        playerCount: Object.keys(players).length

    };

    componentDidMount() {
        Promise.all([this.props.fetchUser(), this.props.fetchRating(this.props.game.originalName)]);
    }

    onProduce = (producer) => {
        this.setState(produce(this.state, producer));
    };

    _onSelectGame = event => {
        this.onProduce(draft => {
            draft.game = this.props.games.find(g => g.originalName === event.target.value);
        });
    };

    calculateResultRating(gameResult) {
        const {ratings} = this.props;
        const gameUserRating = gameResult.map(r => {
                let userRating = ratings.find(rating => rating.name === r.name);
                return {
                    name: r.name,
                    rating: userRating ? userRating.rating : 1000,
                    updated: getTime()
                };
            }
        );

        for (let i = 0; i < gameUserRating.length; i++) {
            let changePoint = 0;
            const current = gameUserRating[i];
            for (let j = 0; j < gameUserRating.length; j++) {
                const opponent = gameUserRating[j];
                if (i !== j) {
                    let s;
                    if (gameResult[i].score > gameResult[j].score)
                        s = 1;
                    if (gameResult[i].score < gameResult[j].score)
                        s = 0;
                    if (gameResult[i].score === gameResult[j].score)
                        s = 0.5;
                    changePoint += elo(current.rating, opponent.rating, s);
                }
            }
            current.nextRating = current.rating + changePoint;
        }
        return gameUserRating.map(r => {
            r.rating = r.nextRating;
            delete r.nextRating;
            return r;
        });
    }

    _onSaveRecord = (players) => {
        const gameResult = sortBy(Object.values(players), (obj) => parseInt(obj.score))
            .reverse()
            .map((r, i) => ({...r, rank: i + 1}));
        const gameUserRating = this.calculateResultRating(gameResult);
        const gameRecord = {
            game: this.state.game.originalName,
            players,
            gameResult
        };
        this.props.requestSaveRecord(gameRecord, gameUserRating)
            .then(_ => {
                alert('저장 완료');
                this.props.selectGame(this.state.game.originalName);
                this.props.history.push('/gameHistory');
            })
    };

    _generateRecord = (game) => {
        const {users} = this.props;
        if (game.clan) {
            return <ClanRecord
                game={game}
                clans={game.clans}
                bid={game.bid}
                users={users}
                onSave={this._onSaveRecord}
            />
        }
        if (game.mahjong) {
            return <MahjongRecord
                game={game}
                users={users}
                onSave={this._onSaveRecord}
            />

        }
        return <NormalRecord
            game={game}
            users={users}
            onSave={this._onSaveRecord}
        />
    };

    render() {
        const {games} = this.props;
        return (
            <section className="recode-game">
                {
                    this.state.game &&
                    <GameSelect
                        games={games}
                        value={this.state.game.originalName}
                        onChange={this._onSelectGame}
                    />
                }
                {
                    this.state.game && this._generateRecord(this.state.game)
                }
            </section>
        )
    }
};
