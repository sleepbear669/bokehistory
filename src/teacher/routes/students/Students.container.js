import {connect} from 'react-redux';
import Students from './Students';
import {fetchStudents, createStudent, deactivateStudent, activateStudent, updateStudent, forcedUpdateUserPassword, switchUser} from "./Students.module";

const mapDispatchToProps = {
    fetchStudents, createStudent, deactivateStudent, activateStudent, updateStudent, forcedUpdateUserPassword, switchUser
};

const mapStateToProps = (state) => ({
    students: state.teacher.students,
    roles: state.teacher.roles
});

export default connect(mapStateToProps, mapDispatchToProps)(Students)
