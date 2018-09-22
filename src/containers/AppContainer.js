import React, {Component} from 'react'
import {connect} from 'react-redux'
import {BrowserRouter as Router} from 'react-router-dom'
import {Provider} from 'react-redux'

class AppContainer extends Component {
    componentDidMount() {
    }

    render() {
        const {routes, store} = this.props;

        return (
            <Provider store={store}>
                <Router>
                    <div style={{height: '100%'}}>
                        {routes}
                    </div>
                </Router>
            </Provider>
        )
    }
}

export default connect(state => ({}), {})(AppContainer)
