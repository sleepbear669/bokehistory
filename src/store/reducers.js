import app from './../modules/app.modules.js';
import gameHistory from './../screen/gameHistory/GameHistory.modules.js';


import {combineReducers} from 'redux'

export const rootReducers = combineReducers({
    app,
    gameHistory
});

export default rootReducers
