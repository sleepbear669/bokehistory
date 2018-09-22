import produce from "immer";

export const AUTH_LOGIN = 'AUTH_LOGIN';
import usersService from 'shared/service/usersService';

export const UPDATE_USER_INFO = 'UPDATE_USER_INFO';
export const FETCH_USER = 'FETCH_USER';

export function fetchUserInfo() {
    return (dispatch) => usersService.fetchUserInfo()
        .then(r => {
            dispatch({type: FETCH_USER, user: r});
            return r;
        });
}

export function updateUserInfo(param) {
    return (dispatch) => usersService.updateUserInfo(param)
        .then(r => {
            dispatch({type: UPDATE_USER_INFO, userInfo: r});
            return r;
        });
}

export function updatePassword(param) {
    return (dispatch) => usersService.updatePassword(param)
        .then(r => {
            return r;
        });
}

const ACTION_HANDLERS = {
    [AUTH_LOGIN]: produce((draft, action) => {
        draft.authToken = action.authToken;
        draft.user = action.user;
    })
};

const initialState = {};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
