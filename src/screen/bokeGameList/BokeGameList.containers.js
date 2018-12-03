import {connect} from 'react-redux';
import BokeGameList from './BokeGameList';
import {requestSaveRecord} from "./BokeGameList.modules";
import {selectGame} from "modules/app.modules";

const mapDispatchToProps = {
    requestSaveRecord,
    selectGame
};

const mapStateToProps = (state) => ({
    games: state.app.games
});

export default connect(mapStateToProps, mapDispatchToProps)(BokeGameList)

