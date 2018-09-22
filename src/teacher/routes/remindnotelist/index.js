import {injectReducer} from 'store/reducers'
import asyncComponent from 'containers/AsyncComponent'

export default (store) => asyncComponent(() => new Promise((resolve) => {
    require.ensure([], (require) => {
        const component = require('./RemindnoteList.container').default;
        const reducer = require('./RemindnoteList.module').default;

        injectReducer(store, {key: 'remindnotelist', reducer});

        resolve({component})
    }, 'remindnotelist')
}));
