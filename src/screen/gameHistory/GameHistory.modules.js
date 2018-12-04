import produce from 'immer';

import gameService from "../../shared/services/gameService";

const FETCH_RECORD = 'FETCH_RECORD';

const ACTION_HANDLERS = {
    [FETCH_RECORD]: produce((draft, action) => {
        draft.records = action.records;

        draft.gameResult = action.gameResult.reduce((a, b) => {
            if (!a.hasOwnProperty(b.name)) {
                a[b.name] = [];
            }
            a[b.name].push(b);
            return a;
        }, {});
    })
};

export function fetchRecord(gameName) {
    return async dispatch => {
        const records = await gameService.fetchRecordByGame(gameName);
        const gameResult = records.reduce((a, b) => a.concat(b.gameResult), []);
        dispatch({type: FETCH_RECORD, records, gameResult});
    }
}

const initialState = {
    records: [],
    gameResult: null
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
