import {combineReducers} from 'redux'
import auth from 'modules/auth';

export const makeRootReducer = (asyncReducers) => {
    return combineReducers({
        auth,
        ...asyncReducers
    })
};

export const injectReducer = (store, {key, reducer}) => {
    if (Object.hasOwnProperty.call(store.asyncReducers, key)) return;
    store.asyncReducers[key] = reducer;
    store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer
