import produce from 'immer';

import gameService from "../../shared/services/gameService";

const FETCH_RECORD = 'FETCH_RECORD';

const ACTION_HANDLERS = {
    [FETCH_RECORD]: produce((draft, action) => {
        draft.records = action.records;
        const ratings = action.ratings;
        const gameResult = action.gameResult.reduce((a, b) => {
            if (!a.hasOwnProperty(b.name)) {
                a[b.name] = [];
            }
            a[b.name].push(b);
            return a;
        }, {});
        console.log(ratings);
        draft.gameResult = Object.keys(gameResult)
            .map(k => {
                const playerHistory = gameResult[k];
                const rating = ratings.find(r => r.name === k);
                return {
                    name: k,
                    rating: rating ? rating.rating : 1000,
                    average: (playerHistory.reduce((a, b) => a + parseInt(b.score), 0) / playerHistory.length),
                    winRate: (playerHistory.filter(r => r.rank === 1).length / playerHistory.length) * 100,
                    playCount: playerHistory.length,
                }
            });
    })
};

export function fetchRecord(gameName) {
    return async dispatch => {
        const records = await gameService.fetchRecordByGame(gameName);
        const ratings = await gameService.fetchRating(gameName);

        const gameResult = records.reduce((a, b) => a.concat(b.gameResult), []);
        dispatch({type: FETCH_RECORD, records, gameResult, ratings});
    }
}

const initialState = {
    records: [],
    gameResult: []
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
