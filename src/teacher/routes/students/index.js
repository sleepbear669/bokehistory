import {injectReducer} from 'store/reducers'
import asyncComponent from 'containers/AsyncComponent'

export default (store) => asyncComponent(() => new Promise((resolve) => {
    require.ensure([], (require) => {
        const ManageStudent = require('./Students.container').default;
        const reducer = require('./Students.module').default;

        injectReducer(store, {key: 'students', reducer});

        resolve({component: ManageStudent})
    }, 'students')
}));

