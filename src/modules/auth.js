
export const AUTH_CHECK = 'AUTH_CHECK';

export function authCheck() {
    return (dispatch, getState) => {
    }
}

const ACTION_HANDLERS = {
    [AUTH_CHECK]: (state, action) => ({
        ...state,
        loginStatus: action.loginStatus
    })
};

export default (state = {auth: null}, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
