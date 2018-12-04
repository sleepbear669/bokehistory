import {connect} from 'react-redux';
import GameHistory from './GameHistory';
import {fetchRecord} from "./GameHistory.modules";

const mapDispatchToProps = {
    fetchRecord
};

const mapStateToProps = (state) => ({
    game: state.app.game,
    records: state.gameHistory.records,
    gameResult: state.gameHistory.gameResult,
});

export default connect(mapStateToProps, mapDispatchToProps)(GameHistory)
