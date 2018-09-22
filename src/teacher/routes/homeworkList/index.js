import {injectReducer} from 'store/reducers'
import asyncComponent from 'containers/AsyncComponent'

export default (store) => asyncComponent(() => new Promise((resolve) => {
    require.ensure([], (require) => {
        const Home = require('./HomeworkList.container').default;
        const reducer = require('./HomeworkList.module').default;

        injectReducer(store, {key: 'homeworkList', reducer});

        resolve({component: Home})
    }, 'homeworkList')
}));

