import {connect} from 'react-redux';
import RecordGame from './RecordGame';
import {requestSaveRecord, fetchUser} from "./RecordGame.modules";
import recordGame from "./RecordGame.modules";

const mapDispatchToProps = {
    requestSaveRecord,
    fetchUser
};

const mapStateToProps = (state) => ({
    games: state.app.games,
    game: state.app.game,
    users: state.recordGame.users
});

export default connect(mapStateToProps, mapDispatchToProps)(RecordGame)
