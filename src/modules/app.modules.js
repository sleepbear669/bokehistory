import produce from 'immer';

import gameService from './../shared/services/gameService';

export const FETCH_GAMES = 'FETCH_GAMES';
export const SELECT_GAME = 'SELECT_GAME';

export function fetchGames() {
    return (dispatch) => {
        return gameService.fetchGames((games) => {
            if (Array.isArray(games)) {
                dispatch({type: FETCH_GAMES, games})
            }
        });
    }
}

export function selectGame(game) {
    return {type: SELECT_GAME, game}
}

const ACTION_HANDLERS = {
    [FETCH_GAMES]: produce((draft, action) => {
        draft.games = action.games;
    }),
    [SELECT_GAME]: produce((draft, action) => {
        draft.game = action.game;
    }),
};

const initialState = {
    games: [],
    game: ''
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
