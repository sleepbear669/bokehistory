import produce from 'immer';

import gameService from './../../shared/services/gameService'
import userService from './../../shared/services/userService';

const SAVE_RECORD = 'SAVE_RECORD';
const FETCH_USER = 'FETCH_USER';
const FETCH_RATING = 'FETCH_RATING';

export function requestSaveRecord(record) {
    return async dispatch => {

        try {
            await gameService.recordGame(record);
            await userService.recordGame(record);
            dispatch({type: SAVE_RECORD});
        } catch (e) {
            console.log(e);
        }
    };
}

export function fetchUser() {
    return async dispatch => {
        try {
            const users = await userService.fetchUser();
            dispatch({type: FETCH_USER, users});
        } catch (e) {
            console.log(e);
        }
    };
}

export function fetchRating(gameOriginalName) {
    return async dispatch => {
        try {
            const ratings = await gameService.fetchRating(gameOriginalName);
            dispatch({type: FETCH_RATING, ratings});
        } catch (e) {
            console.log(e);
        }
    };
}

const ACTION_HANDLERS = {
    [SAVE_RECORD]: produce((draft, action) => {

    }),
    [FETCH_USER]: produce((draft, action) => {
        draft.users = action.users;
    }),
    [FETCH_RATING]: produce((draft, action) => {
        draft.rating = action.rating;
    }),
};

const initialState = {
    users: [],
    ratings: []
};


export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
