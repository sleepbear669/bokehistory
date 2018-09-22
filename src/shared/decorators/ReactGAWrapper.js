import React from "react";
import ReactGA from 'react-ga';

export default function ReactGAWrapper(WrappedComponent) {
    return class ReactGaWrapperComponent extends React.Component {
        componentWillMount() {
            this.unlisten = this.props.history.listen((location, action) => {
                ReactGA.pageview(location.pathname);
            });
        }

        componentWillUnmount() {
            this.unlisten();
        }

        render() {
            return <WrappedComponent {...this.props}/>
        }

    }
}