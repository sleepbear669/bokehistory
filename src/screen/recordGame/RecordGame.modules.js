import gameService from './../../shared/services/gameService'

const ACTION_HANDLERS = {
};

export default (state = {auth: null}, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
