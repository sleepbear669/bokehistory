import {injectReducer} from 'store/reducers'
import asyncComponent from 'containers/AsyncComponent'

export default (store) => asyncComponent(() => new Promise((resolve) => {
    require.ensure([], (require) => {
        const Operator = require('./containers/TeacherContainer').default;
        const reducer = require('./modules/teacher').default;
        const routes = require('./routes/index').default(store);

        injectReducer(store, {key: 'teacher', reducer});

        resolve({component: Operator, routes});
    }, 'teacher')
}));
