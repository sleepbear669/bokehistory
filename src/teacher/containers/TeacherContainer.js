import {connect} from 'react-redux';
import Teacher from '../components/Teacher';
import {fetchStudents, fetchUserInfo, fetchToadToken, checkSignComplete, isSignCompleted, isNewContractAcademy} from "../modules/teacher";

const mapDispatchToProps = {
    fetchStudents, fetchUserInfo, fetchToadToken, checkSignComplete, isSignCompleted, isNewContractAcademy
};

const mapStateToProps = (state) => ({
    isDevAcademy: state.teacher.user.academy && state.teacher.user.academy.id === 1,
    students: state.teacher.students,
    user: state.teacher.user,
    roles: state.teacher.roles,
});

export default connect(mapStateToProps, mapDispatchToProps)(Teacher)
