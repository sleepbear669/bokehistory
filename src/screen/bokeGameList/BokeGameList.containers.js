import {connect} from 'react-redux';
import BokeGameList from './BokeGameList';
import {requestSaveRecord} from "./BokeGameList.modules";

const mapDispatchToProps = {
    requestSaveRecord
};

const mapStateToProps = (state) => ({
    games: state.app.games
});

export default connect(mapStateToProps, mapDispatchToProps)(BokeGameList)

