import React from "react";
import DocumentTitle from 'react-document-title';

export default function DocumentTitleWrapper(title) {
    return (WrappedComponent) => class DocumentTitleWrapperComponent extends React.Component {
        render() {
            return (
                <DocumentTitle title={title}>
                    <WrappedComponent {...this.props}/>
                </DocumentTitle>
            )
        }
    }
}