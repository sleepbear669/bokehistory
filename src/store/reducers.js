import app from './../modules/app.modules.js';
import gameHistory from './../screen/gameHistory/GameHistory.modules.js';
import recordGame from './../screen/recordGame/RecordGame.modules';


import {combineReducers} from 'redux'

export const rootReducers = combineReducers({
    app,
    gameHistory,
    recordGame
});

export default rootReducers
