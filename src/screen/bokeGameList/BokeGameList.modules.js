import produce from 'immer';

import recordService from './../../shared/services/recordService'

const SAVE_RECORD = 'SAVE_RECORD';


export function requestSaveRecord(record) {
    return async dispatch => {
        await recordService.recordGame(record);
        dispatch({type: SAVE_RECORD});

    };
}

const ACTION_HANDLERS = {
    [SAVE_RECORD]: produce((draft, action) => {

    })
};

export default (state = {auth: null}, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
