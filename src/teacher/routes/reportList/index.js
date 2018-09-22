import {injectReducer} from 'store/reducers'
import asyncComponent from 'containers/AsyncComponent'

export default (store) => asyncComponent(() => new Promise((resolve) => {
    require.ensure([], (require) => {
        const Home = require('./ReportList.container').default;
        const reducer = require('./ReportList.module').default;

        injectReducer(store, {key: 'reportList', reducer});

        resolve({component: Home})
    }, 'reportList')
}));

