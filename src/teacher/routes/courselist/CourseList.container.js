import {connect} from 'react-redux';
import CourseList from './CourseList';
import * as exportedModule from "./CourseList.module";
import {getExportedFunctions} from '../../../shared/moduleUtils';

const mapDispatchToProps = getExportedFunctions(exportedModule);

const mapStateToProps = (state) => ({
    ...state.courselist
});

export default connect(mapStateToProps, mapDispatchToProps)(CourseList)
