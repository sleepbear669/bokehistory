import {connect} from 'react-redux';
import UserInfo from './UserInfo';
import {fetchUserInfo, updateUserInfo, updatePassword} from "./UserInfo.module";

const mapDispatchToProps = {
    fetchUserInfo, updateUserInfo, updatePassword
};

const mapStateToProps = (state) => ({
    user: state.teacher.user,
});

export default connect(mapStateToProps, mapDispatchToProps)(UserInfo)
