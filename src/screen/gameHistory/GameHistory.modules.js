import produce from 'immer';

import recordService from 'shared/services/recordService';

const FETCH_RECORD = 'FETCH_RECORD';

const ACTION_HANDLERS = {
    [FETCH_RECORD]: produce((draft, action) => {
        draft.records = action.records;
    })
};

export function fetchRecord() {
    return async dispatch => {
        const recordsSnapshot = await recordService.fetchGameRecord();
        const records = recordsSnapshot.docs
            .map(doc => doc.data());
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
