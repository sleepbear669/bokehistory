import {connect} from 'react-redux';
import Course from './Course';
import {fetchCourse, addStudent, renameCourse, fetchTextbookDetail, fetchStudentSummary} from "./Course.module";

const mapDispatchToProps = {
    fetchCourse, addStudent, renameCourse, fetchTextbookDetail, fetchStudentSummary
};

const mapStateToProps = (state) => ({
    students: state.teacher.students,
    course: state.course.course,
    textbookDetail: state.course.textbookDetail,
    textbookDetailByChapterName:  state.course.textbookDetailByChapterName,
    studentSummaries:  state.course.studentSummaries,
    summariesByStudentId:  state.course.summariesByStudentId,
});

export default connect(mapStateToProps, mapDispatchToProps)(Course)
