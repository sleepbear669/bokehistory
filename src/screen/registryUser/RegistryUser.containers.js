import {connect} from 'react-redux';
import RegistryUser from './RegistryUser';
import {addUser} from "./RegistryUser.modules";

const mapDispatchToProps = {
    addUser
};

const mapStateToProps = (state) => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(RegistryUser)
