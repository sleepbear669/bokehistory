import {injectReducer} from 'store/reducers'
import asyncComponent from 'containers/AsyncComponent'

export default (store) => asyncComponent(() => new Promise((resolve) => {
    require.ensure([], (require) => {
        const Home = require('./Course.container').default;
        const reducer = require('./Course.module').default;

        injectReducer(store, {key: 'course', reducer});

        resolve({component: Home})
    }, 'course')
}));

