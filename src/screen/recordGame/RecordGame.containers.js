import {connect} from 'react-redux';
import RecordGame from './RecordGame';
import {requestSaveRecord, fetchUser} from "./RecordGame.modules";
import {selectGame} from "modules/app.modules";

const mapDispatchToProps = {
    requestSaveRecord,
    fetchUser,
    selectGame
};

const mapStateToProps = (state) => ({
    games: state.app.games,
    game: state.app.game,
    users: state.recordGame.users
});

export default connect(mapStateToProps, mapDispatchToProps)(RecordGame)
