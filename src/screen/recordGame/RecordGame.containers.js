import {connect} from 'react-redux';
import RecordGame from './RecordGame';
import {requestSaveRecord, fetchUser, fetchRating} from "./RecordGame.modules";
import {selectGame} from "modules/app.modules";

const mapDispatchToProps = {
    requestSaveRecord,
    fetchUser,
    selectGame,
    fetchRating
};

const mapStateToProps = (state) => ({
    games: state.app.games,
    game: state.app.game,
    users: state.recordGame.users,
    ratings: state.recordGame.ratings
});

export default connect(mapStateToProps, mapDispatchToProps)(RecordGame)
