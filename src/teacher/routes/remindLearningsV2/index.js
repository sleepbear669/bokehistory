import {injectReducer} from 'store/reducers'
import asyncComponent from 'containers/AsyncComponent'

export default (store) => asyncComponent(() => new Promise((resolve) => {
    require.ensure([], (require) => {
        const component = require('./RemindLearnings.container').default;
        const reducer = require('./RemindLearnings.module').default;

        injectReducer(store, {key: 'remindLearnings', reducer});

        resolve({component})
    }, 'remindLearnings')
}));

