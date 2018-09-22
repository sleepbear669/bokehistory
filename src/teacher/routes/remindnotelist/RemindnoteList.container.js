import {connect} from 'react-redux';
import RemindnoteList from './RemindnoteList';
import {
    fetchTextbookLearnings,
    fetchRecommendLearnings,
    createRemindNoteByMadLearning,
    createRemindNoteByTextbook,
} from "./RemindnoteList.module";
import {
    fetchCourse
} from "./../course/Course.module";

const mapDispatchToProps = {
    fetchTextbookLearnings,
    fetchRecommendLearnings,
    createRemindNoteByMadLearning,
    createRemindNoteByTextbook,
    fetchCourse,
};

const mapStateToProps = (state) => ({
    textbookLearnings: state.remindnotelist.textbookLearnings,
    recommendLearnings: state.remindnotelist.recommendLearnings,
    createResult: state.remindnotelist.createResult,
    course: state.course.course,
});

export default connect(mapStateToProps, mapDispatchToProps)(RemindnoteList)
