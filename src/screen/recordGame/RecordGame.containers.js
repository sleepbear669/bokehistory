import {connect} from 'react-redux';
import RecordGame from './RecordGame';
import {requestSaveRecord} from "./RecordGame.modules";

const mapDispatchToProps = {
    requestSaveRecord
};

const mapStateToProps = (state) => ({
    games: state.app.games
});

export default connect(mapStateToProps, mapDispatchToProps)(RecordGame)
