import {connect} from 'react-redux';
import RemindLearnings from './RemindLearnings';
import {
    fetchRemindLearnings,
    createRemindLearning,
    fetchCandidateCount,
    previewRemindLearning,
    fetchCourses,
    fetchTopChapters,
} from "./RemindLearnings.module";

const mapDispatchToProps = {
    fetchRemindLearnings,
    createRemindLearning,
    fetchCandidateCount,
    previewRemindLearning,
    fetchCourses,
    fetchTopChapters
};

const mapStateToProps = (state) => ({
    students: state.teacher.students,
    ...state.remindLearnings
});

export default connect(mapStateToProps, mapDispatchToProps)(RemindLearnings)
