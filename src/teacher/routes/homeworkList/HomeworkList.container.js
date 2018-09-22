import {connect} from 'react-redux';
import HomeworkList from './HomeworkList';
import {
    createHomework,
    fetchHomework,
    fetchHomeworks,
    createHomeworkLearnings,
    fetchHomeworkLearnings,
    submitAnswer,
    addStudentsToHomework,
    removeStudentsToHomework,
    fetchLearning,
    fetchCandidates,
    deleteHomework,
    resetLearning,
    fetchTopChapters,
    fetchLearningStats
} from "./HomeworkList.module";

const mapDispatchToProps = {
    createHomework,
    fetchHomework,
    fetchHomeworks,
    createHomeworkLearnings,
    fetchHomeworkLearnings,
    submitAnswer,
    addStudentsToHomework,
    removeStudentsToHomework,
    fetchLearning,
    fetchCandidates,
    deleteHomework,
    resetLearning,
    fetchTopChapters,
    fetchLearningStats
};

const mapStateToProps = (state) => ({
    course: state.course.course,
    textbookDetail: state.course.textbookDetail,
    textbookDetailByChapterName: state.course.textbookDetailByChapterName,
    homeworkDetail: state.homeworkList.homeworkDetail,
    homeworkList: state.homeworkList.homeworkList,
    students: state.teacher.students,
    homeworkLearning: state.homeworkList.homeworkLearning,
    submitResult: state.homeworkList.submitResult,
    learning: state.homeworkList.learning,
    candidates: state.homeworkList.candidates,
    chapters: state.homeworkList.chapters,
    learningStats: state.homeworkList.learningStats,
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeworkList)
