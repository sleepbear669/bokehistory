import React, {PureComponent} from 'react';
import DocumentTitle from 'react-document-title';
import './Students.scss';
import {setItem, getItem, removeItem} from 'shared/localStorageHelper';
import {
    StudentsManage
} from "jokerComponents";

export default class Students extends PureComponent {

    componentDidMount() {
        this.props.fetchStudents();
    }

    switchUser = (student) => {
        setItem('previousLocation', this.props.location.pathname);
        this.props.switchUser(student)
    };

    render() {
        const props = this.props;
        return <DocumentTitle title='학생관리'>
            <div>
                <StudentsManage
                    pageTitle={'학생관리'}
                    fetchStudents={props.fetchStudents}
                    createStudent={props.createStudent}
                    updateStudent={props.updateStudent}
                    activateStudent={props.activateStudent}
                    forcedUpdateUserPassword={props.forcedUpdateUserPassword}
                    deactivateStudent={props.deactivateStudent}
                    switchUser={this.switchUser}
                    students={props.students}
                    roles={props.roles}
                />
            </div>
        </DocumentTitle>
    }
};
