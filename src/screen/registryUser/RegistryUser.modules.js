import userService from './../../shared/services/userService';

const ADD_USER = 'ADD_USER';

const ACTION_HANDLERS = {
    [ADD_USER]: () => {
    }
};

export function addUser(name) {
    return async dispatch => {
        const doc = await userService.fetchUserByName(name);
        if (!doc.exists) {
            await userService.addUser(name);
            dispatch({type: ADD_USER})
        } else {
            throw '등록된 이름입니다.';
        }
    }
}

export default (state = {auth: null}, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
