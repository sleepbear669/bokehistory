import produce from 'immer';

import gameService from './../shared/services/gameService';
import ratingService from './../shared/services/ratingService';

export const FETCH_GAMES = 'FETCH_GAMES';
export const SELECT_GAME = 'SELECT_GAME';

const clans = [{name: '아우렌'},
    {name: '마녀'},
    {name: '연금술사'},
    {name: '암흑인'},
    {name: '광신도'},
    {name: '소인'},
    {name: '난쟁이'},
    {name: '기술자'},
    {name: '인어'},
    {name: '군집어인'},
    {name: '혼돈술사'},
    {name: '거인'},
    {name: '고행수도자'},
    {name: '유목민'},
    {name: '얼음 여인'},
    {name: '설인'},
    {name: '봉헌자'},
    {name: '용군주'},
    {name: '연안민'},
    {name: '둔갑술사'}];


export function fetchGames() {
    return async (dispatch) => {
        const games = await gameService.fetchGames();
        // gameService.updateClan('terra_mystica', clans);
        dispatch({type: FETCH_GAMES, games});
    }
}

export function selectGame(gameName) {
    return {type: SELECT_GAME, gameName}
}

const ACTION_HANDLERS = {
    [FETCH_GAMES]: produce((draft, action) => {
        draft.games = action.games;
    }),
    [SELECT_GAME]: produce((draft, action) => {
        draft.game = draft.games.find(g => g.originalName === action.gameName);
    }),
};

const initialState = {
    games: [],
    game: null
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
