import {connect} from 'react-redux';
import CourseStudentAnswer from './CourseStudentAnswer';
import {fetchCourse, fetchTextbook, fetchLearning, fetchLearnings, fetchRecommendLearnings, createTextbookLearning, createRecommendLearning, submitAnswer, checkDuplications, resetLearning, candidates} from "./CourseStudentAnswer.module";
import {fetchStudentSummary} from "../course/Course.module";

const mapDispatchToProps = {
    fetchCourse, fetchTextbook, fetchLearning, fetchLearnings, fetchRecommendLearnings, createTextbookLearning, createRecommendLearning, submitAnswer, checkDuplications, resetLearning, candidates, fetchStudentSummary
};

const mapStateToProps = (state) => ({
    course: state.coursestudentanswer.course,
    textbook: state.coursestudentanswer.textbook,
    learnings: state.coursestudentanswer.learnings,
    recommendLearnings: state.coursestudentanswer.recommendLearnings,
    candidatesResult: state.coursestudentanswer.candidatesResult,
    summariesByStudentId: state.course ? state.course.summariesByStudentId : null,
});

export default connect(mapStateToProps, mapDispatchToProps)(CourseStudentAnswer)
