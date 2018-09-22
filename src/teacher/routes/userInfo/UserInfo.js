import React, {PureComponent} from 'react';
import DocumentTitle from 'react-document-title';
import './UserInfo.scss';
import {
    MadSubTitle,
    Gap,
    MadButton,
    MadInput,
    MadModal,
    MadLabeled,
    SimpleRowList
} from 'madComponents';
import FormUtils, {FORM_TYPE} from "../../../shared/formUtils";

export default class UserInfo extends PureComponent {

    state = {
        openPasswordChangeModal: false,
        updateUserInfo: {
            username: '',
            image: '',
            nickname: '',
            address: '',
            phoneNumber: '',
            grade: '',
            email: ''
        },
        updateUserPassword: {
            password: '',
            newPassword: '',
            repeatPassword: '',
            repeatNewPassword: '',

        },
        updateFormErrorMessage: {
            nickname: '최소 2자 이상 입력해주세요.',
            password: '최소 6자 이상 입력해주세요.',
            phoneNumber: '형식에 맞게 입력해주세요',
            email: '형식에 맞게 입력해주세요'
        }
    };

    componentWillMount() {
        this.fetchUserInfo();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            updateUserInfo: {
                username: nextProps.user.username,
                nickname: nextProps.user.nickname || '',
                address: nextProps.user.address || '',
                phoneNumber: nextProps.user.phoneNumber || '',
                email: nextProps.user.email || ''
            }
        });
    }

    fetchUserInfo = () => {
        this.props.fetchUserInfo();
    };

    updateUserInfo = () => {
        this.props.updateUserInfo(this.state.updateUserInfo).then(() => {
            this.fetchUserInfo();
            alert("변경되었습니다.");
        });
    };

    openPasswordChangeModal = (student) => {
        this.setState({
            openPasswordChangeModal: true,
            updateUserPassword: {
                password: '',
                newPassword: '',
                repeatNewPassword: ''

            }
        })
    };

    closePasswordChangeModal = () => {
        this.setState({
            openPasswordChangeModal: false,
        })
    };

    updateUserPassword = () => {
        const password = this.state.updateUserPassword;
        if (this.checkPassword(password)) {
            this.props.updatePassword(password).then(r => {
                if (r === null || r === "") {
                    this.closePasswordChangeModal();
                    alert("변경 되었습니다.")
                } else if (r[0].field === "password") {
                    alert(r[0].defaultMessage);
                }
            });
        }
    };

    checkPassword = (password) => {
        if (password.password === '') {
            alert("현재 비밀번호를 입력해 주세요.");
            return false;
        }
        else if (password.newPassword === '') {
            alert("새 비밀번호를 입력해 주세요.");
            return false;
        }
        else if (password.repeatNewPassword === '') {
            alert("새 비밀번호 확인을 입력해 주세요.");
            return false;
        }
        else if (password.newPassword !== password.repeatNewPassword) {
            alert("새 비밀번호와 새 비밀번호 확인 값이 다릅니다.");
            return false;
        }
        return true;
    };

    updateUserInfoParamCheck = () => {
        const userInfo = this.state.updateUserInfo;
        return userInfo.nickname === ""
            || userInfo.nickname.length < 2
            || userInfo.address === ""
            || userInfo.phoneNumber !== "" && !FormUtils.checkPhoneNumber(userInfo.phoneNumber, FORM_TYPE.TEL.pattern)
            || userInfo.email !== "" && !FormUtils.checkEmail(userInfo.email)
    };

    render() {
        const {
            updateUserInfo,
            updateUserPassword
        } = this.state;

        return <DocumentTitle title='개인정보'>
            <div className="user-info">
                <div className="user-info-header">
                    <MadSubTitle text="개인정보 관리"/>

                </div>
                <Gap/>
                {
                    this.props.user &&
                    <div className="row">
                        <div className="column is-12">
                            <div className="card">
                                <Gap md/>
                                <SimpleRowList>
                                    <MadLabeled label={'아이디'} labelAlign={'left'} labelWidth={'15%'}>
                                        <MadInput text={updateUserInfo.username}
                                                  placeholder={'아이디'}
                                                  width={'30%'}
                                                  disabled={true}
                                        />
                                    </MadLabeled>
                                    <MadLabeled label={'이름'} labelAlign={'left'} labelWidth={'15%'} required={true}>
                                        <MadInput text={updateUserInfo.nickname}
                                                  placeholder={'이름'}
                                                  width={'30%'}
                                                  errorMessage={updateUserInfo.nickname.length < 2 && updateUserInfo.nickname !== "" ? this.state.updateFormErrorMessage.nickname : ''}
                                                  onChange={e => this.setState({
                                                      updateUserInfo: {
                                                          ...updateUserInfo,
                                                          nickname: e.target.value
                                                      }
                                                  })}/>
                                    </MadLabeled>
                                    <MadLabeled label={'비밀번호'} labelAlign={'left'} labelWidth={'15%'}>
                                        <MadButton text="비밀번호 변경"
                                                   secondary
                                                   onClick={this.openPasswordChangeModal}/>
                                    </MadLabeled>
                                    <MadLabeled label={'주소'} labelAlign={'left'} labelWidth={'15%'} required={true}>
                                        <MadInput text={updateUserInfo.address}
                                                  placeholder={'주소'}
                                                  width={'70%'}
                                                  onChange={e => this.setState({
                                                      updateUserInfo: {
                                                          ...updateUserInfo,
                                                          address: e.target.value
                                                      }
                                                  })}/>
                                    </MadLabeled>
                                    <MadLabeled label={'휴대폰'} labelAlign={'left'} labelWidth={'15%'}>
                                        <MadInput text={FormUtils.toPhoneNumberFormat(updateUserInfo.phoneNumber)}
                                                  errorMessage={this.state.updateFormErrorMessage.phoneNumber}
                                                  pattern={FORM_TYPE.CELLPHONE.pattern}
                                                  placeholder={FORM_TYPE.CELLPHONE.placeholder}
                                                  width={'40%'}
                                                  onChange={e => this.setState({
                                                      updateUserInfo: {
                                                          ...updateUserInfo,
                                                          phoneNumber: FormUtils.toPhoneNumberFormat(e.target.value)
                                                      }
                                                  })}/>
                                    </MadLabeled>
                                    <MadLabeled label={'이메일'} labelAlign={'left'} labelWidth={'15%'}>
                                        <MadInput text={updateUserInfo.email}
                                                  errorMessage={this.state.updateFormErrorMessage.email}
                                                  pattern={FORM_TYPE.EMAIL.pattern}
                                                  placeholder={FORM_TYPE.EMAIL.placeholder}
                                                  width={'40%'}
                                                  onChange={e => this.setState({
                                                      updateUserInfo: {
                                                          ...updateUserInfo,
                                                          email: e.target.value
                                                      }
                                                  })}/>
                                    </MadLabeled>
                                </SimpleRowList>
                                <Gap lg/>
                                <div className="row">
                                    <div className="column is-12 center">
                                        <MadButton text="저장" onClick={this.updateUserInfo} disabled={this.updateUserInfoParamCheck()}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {
                    updateUserPassword &&
                    <MadModal
                        isOpen={this.state.openPasswordChangeModal}
                        onRequestClose={this.closePasswordChangeModal}
                        closeButton={true}>
                        <MadSubTitle>비밀번호 변경</MadSubTitle>
                        <Gap md/>
                        <SimpleRowList>
                            <MadLabeled label={'현재 비밀번호'} labelAlign={'left'} labelWidth={'30%'} required={true}>
                                <MadInput text={updateUserPassword.password}
                                          placeholder={'현재 비밀번호'}
                                          type={'password'}
                                          width={'100%'}
                                          errorMessage={FormUtils.checkPasswordLength(updateUserPassword.password) ? this.state.updateFormErrorMessage.password : ''}
                                          onChange={e => this.setState({
                                              updateUserPassword: {
                                                  ...updateUserPassword,
                                                  password: e.target.value
                                              }
                                          })}/>
                            </MadLabeled>
                            <MadLabeled label={'새 비밀번호'} labelAlign={'left'} labelWidth={'30%'} required={true}>
                                <MadInput text={updateUserPassword.newPassword}
                                          placeholder={'새 비밀번호'}
                                          type={'password'}
                                          width={'100%'}
                                          errorMessage={FormUtils.checkPasswordLength(updateUserPassword.newPassword) ? this.state.updateFormErrorMessage.password : ''}
                                          onChange={e => this.setState({
                                              updateUserPassword: {
                                                  ...updateUserPassword,
                                                  newPassword: e.target.value
                                              }
                                          })}/>
                            </MadLabeled>
                            <MadLabeled label={'새 비밀번호 확인'} labelAlign={'left'} labelWidth={'30%'} required={true}>
                                <MadInput text={updateUserPassword.repeatNewPassword}
                                          type={'password'}
                                          width={'100%'}
                                          placeholder="새 비밀번호 확인"
                                          errorMessage={FormUtils.checkPasswordLength(updateUserPassword.repeatNewPassword) ? this.state.updateFormErrorMessage.password : ''}
                                          onChange={e => this.setState({
                                              updateUserPassword: {
                                                  ...updateUserPassword,
                                                  repeatNewPassword: e.target.value
                                              }
                                          })}/>
                            </MadLabeled>
                        </SimpleRowList>
                        <Gap md/>
                        <div className="row center">
                            <div className="column is-12">
                                <MadButton text="변경" onClick={() => this.updateUserPassword()} disabled={!updateUserPassword.password || !updateUserPassword.newPassword || !updateUserPassword.repeatNewPassword}/>
                            </div>
                        </div>
                    </MadModal>
                }
            </div>
        </DocumentTitle>
    }
};
