import produce from 'immer';

import gameService from './../shared/services/gameService';

export const FETCH_GAMES = 'FETCH_GAMES';
export const SELECT_GAME = 'SELECT_GAME';

const clans = [{name: '발타크'},
    {name: '매드 안드로이드'},
    {name: '테란'},
    {name: '기오덴'},
    {name: '란티다'},
    {name: '파이락'},
    {name: '글린'},
    {name: '제노스'},
    {name: '아이타'},
    {name: '네뷸라'},
    {name: '하이브'},
    {name: '하드쉬 할라'},
    {name: '엠바스'},
    {name: '타클론'}];


export function fetchGames() {
    return async (dispatch) => {
        const games = await gameService.fetchGames();
        // gameService.updateClan('gaia_project', clans);
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
