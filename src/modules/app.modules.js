import produce from 'immer';

import gameService from './../shared/services/gameService';

export const FETCH_GAMES = 'FETCH_GAMES';

export function fetchGames() {
    return (dispatch) => {
        return gameService.fetchGames((games) => {
            if (Array.isArray(games)) {
                dispatch({type: FETCH_GAMES, games})
            }
        });
    }
}

const ACTION_HANDLERS = {
    [FETCH_GAMES]: produce((draft, action) => {
        draft.games = action.games;
    }),
};

const initialState = {
    games: []
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
