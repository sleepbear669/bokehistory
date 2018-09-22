import {injectReducer} from 'store/reducers'
import asyncComponent from 'containers/AsyncComponent'

export default (store) => asyncComponent(() => new Promise((resolve) => {
    require.ensure([], (require) => {
        const ManageStudent = require('./UserInfo.container').default;
        const reducer = require('./UserInfo.module').default;

        injectReducer(store, {key: 'userInfo', reducer});

        resolve({component: ManageStudent})
    }, 'userInfo')
}));

