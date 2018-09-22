import {injectReducer} from 'store/reducers'
import asyncComponent from 'containers/AsyncComponent'

export default (store) => asyncComponent(() => new Promise((resolve) => {
    require.ensure([], (require) => {
        const Home = require('./CourseList.container').default;
        const reducer = require('./CourseList.module').default;

        injectReducer(store, {key: 'courselist', reducer});

        resolve({component: Home})
    }, 'courselist')
}));

