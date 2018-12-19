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

    calculateResultRating(gameResult){
        const {ratings} = this.props;

        const gameUserRating = gameResult.map(r => {
                let userRating = ratings.find(rating => rating.name === r.name);
                if (userRating === undefined) {
                    userRating = {
                        name: r.name,
                        rating: 1000,
                        updated: getTime()
                    }
                }
                return userRating;
            }
        );

        gameUserRating.forEach((rating, i) => {
            if (i === 0) {
                const loseTeamAvgRating = gameUserRating.slice(1).reduce((a, b) => a + b.rating, 0) / (gameUserRating.length - 1);
                rating.rating += elo(rating.rating, loseTeamAvgRating, 1);
            }
            if (i === 1) {
                rating.rating += elo(rating.rating, gameUserRating[0].rating, 0.5);
            }
            if (i > 1) {
                rating.rating += elo(rating.rating, gameUserRating[0].rating, 0);
            }
        });
    }

    _onSaveRecord = (players) => {
        const {ratings} = this.props;
        const gameResult = sortBy(Object.values(players), (obj) => parseInt(obj.score))
            .reverse()
            .map((r, i) => ({...r, rank: i + 1}));
        const gameUserRating = this.calculateResultRating(gameResult);

        const gameRecord = {
            game: this.state.game.originalName,
            players,
            gameResult
        };
        this.props.requestSaveRecord(gameRecord)
            .then(_ => {
                alert('저장 완료');
                this.props.selectGame(this.state.game);
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
                <GameSelect
                    games={games}
                    value={this.state.game.originalName}
                    onChange={this._onSelectGame}
                />
                {
                    this.state.game && this._generateRecord(this.state.game)
                }
            </section>
        )
    }
};
