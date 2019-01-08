import produce from 'immer';

import gameService from "../../shared/services/gameService";

const FETCH_RECORD = 'FETCH_RECORD';

const ACTION_HANDLERS = {
    [FETCH_RECORD]: produce((draft, action) => {
        draft.records = action.records;
        draft.ratings = action.ratings;
        draft.gameResult = action.gameResult;
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
    gameResult: [],
    ratings: []
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
