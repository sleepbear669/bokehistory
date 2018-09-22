import {connect} from 'react-redux';
import ReportList from './ReportList';
import {
    createReportData,
    getReportData,
    fetchCourse,
    sendSms,
    listSms,
} from "./ReportList.module";

const mapDispatchToProps = {
    createReportData,
    getReportData,
    fetchCourse,
    sendSms,
    listSms,
};

const mapStateToProps = (state) => ({
    course: state.reportList.course,
    recentSmsHistory: state.reportList.recentSmsHistory,
});

export default connect(mapStateToProps, mapDispatchToProps)(ReportList)
