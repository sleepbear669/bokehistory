import produce from 'immer';

import gameService from "../../shared/services/gameService";

const FETCH_RECORD = 'FETCH_RECORD';

const ACTION_HANDLERS = {
    [FETCH_RECORD]: produce((draft, action) => {
        draft.records = action.records;
    })
};

export function fetchRecord(gameName) {
    return async dispatch => {
        const records = await gameService.fetchRecordByGame(gameName);
        dispatch({type: FETCH_RECORD, records});
    }
}

const initialState = {
    records: []
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
