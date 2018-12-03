import {connect} from 'react-redux';
import RegistryGame from './RegistryGame';
import {addGame} from "./RegistryGame.modules";

const mapDispatchToProps = {
    addGame
};

const mapStateToProps = (state) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(RegistryGame)
