import gameService from './../../shared/services/gameService';

const ADD_GAME = 'ADD_GAME';

const ACTION_HANDLERS = {};

export function addGame(gameInfo, thumbnail) {
    return async dispatch => {
        const doc = await gameService.fetchGameByName(gameInfo.name);
        console.log(gameInfo);
        console.log(doc.exists);
        if (!doc.exists) {
            console.log(doc.exists);
            await gameService.addGame(gameInfo, thumbnail);
            dispatch({type: ADD_GAME})
        } else {
            throw '등록된 게임입니다.';
        }
    }
}

export default (state = {auth: null}, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
