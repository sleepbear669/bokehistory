import {connect} from 'react-redux';
import RemindLearnings from './RemindLearnings';
import {
    fetchRemindLearnings,
    createRemindLearning,
    fetchCandidateCount,
    previewRemindLearning,
    fetchCourses
} from "./RemindLearnings.module";

const mapDispatchToProps = {
    fetchRemindLearnings,
    createRemindLearning,
    fetchCandidateCount,
    previewRemindLearning,
    fetchCourses
};

const mapStateToProps = (state) => ({
    students: state.teacher.students,
    ...state.remindLearnings
});

export default connect(mapStateToProps, mapDispatchToProps)(RemindLearnings)
