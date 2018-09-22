import {injectReducer} from 'store/reducers'
import asyncComponent from 'containers/AsyncComponent'

export default (store) => asyncComponent(() => new Promise((resolve) => {
    require.ensure([], (require) => {
        const Home = require('./CourseStudent.container').default;
        const reducer = require('./CourseStudent.module').default;

        injectReducer(store, {key: 'coursestudent', reducer});

        resolve({component: Home})
    }, 'coursestudent')
}));

