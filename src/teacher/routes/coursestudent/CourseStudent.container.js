import {connect} from 'react-redux';
import CourseStudent from './CourseStudent';
import {fetchCourse, addStudent, removeStudent} from "./CourseStudent.module";

const mapDispatchToProps = {
    fetchCourse, addStudent, removeStudent
};

const mapStateToProps = (state) => ({
    students: state.teacher.students,
    course: state.coursestudent.course,
    studentSummaries: state.course ? state.course.studentSummaries : null,
    summariesByStudentId: state.course ? state.course.summariesByStudentId : null,
});

export default connect(mapStateToProps, mapDispatchToProps)(CourseStudent)
