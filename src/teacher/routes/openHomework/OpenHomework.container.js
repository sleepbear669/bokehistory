import {connect} from 'react-redux';
import OpenHomeworks from "./OpenHomework"
import * as exportedModule from "./OpenHomework.module";
import {getExportedFunctions} from '../../../shared/moduleUtils';
const mapDispatchToProps = getExportedFunctions(exportedModule);

const mapStateToProps = (state) => ({
    ...state.openHomework,
    students: state.teacher.students,
});

export default connect(mapStateToProps, mapDispatchToProps)(OpenHomeworks)
