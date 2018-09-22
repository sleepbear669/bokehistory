import {injectReducer} from 'store/reducers'
import asyncComponent from 'containers/AsyncComponent'

export default (store) => asyncComponent(() => new Promise((resolve) => {
    require.ensure([], (require) => {
        const OpenHomework = require('./OpenHomework.container').default;
        const reducer = require('./OpenHomework.module').default;

        injectReducer(store, {key: 'openHomework', reducer});

        resolve({component: OpenHomework})
    }, 'openHomework')
}));

