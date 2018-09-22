const TOAD_BASE_URL = TOAD_SERVICE_URL;
const SIGN_BASE_URL = SIGN_SERVICE_URL;

import React, {PureComponent} from 'react';
import {
    MadModal,
    MadButton,
    MadSubTitle,
    MadLocalDateFormat,
    MadTag,
    Gap,
    ErrorBoundary,
} from 'madComponents';
import {
    MadHeader,
    MadRoleSideBar,
} from "jokerComponents";
import loginService from 'shared/service/loginService';
import noticeService from 'shared/service/noticeService';
import {ACADEMY_STATUS} from 'shared/academyStatus';
import {ReactGAWrapper} from 'shared/decorators';
import {setItem} from 'shared/localStorageHelper';
import './Teacher.scss';
import {CONTRACT_TYPE} from 'shared/contractType';

let toadWindow = null;

@ReactGAWrapper
export default class Teacher extends PureComponent {

    state = {
        sidebarVisibility: false,
        sidebarDisplay: 'none',
        openDoContractModal: false,
        canClose: false,
        modal: {},
        latestNotices: [],
        recentNotices: [],
    };

    componentWillUnmount() {
        this.hideSidebar();
    }

    componentDidMount() {
        this.props.fetchStudents();
        this.props.fetchUserInfo().then(profile => {
            let roles = profile.authorities.map(a => a.authority);

            if (profile.academy && profile.academy.academyStatus === ACADEMY_STATUS.DISABLED) {
                this.openModal('disableAcademyModal');
            } else if(profile.academy && profile.academy.academyStatus === ACADEMY_STATUS.UPGRADE) {
                this.props.history.push('/academymanager/payment');
            } else if (profile.academy && profile.academy.academyStatus !== ACADEMY_STATUS.TEST) {
                this.props.checkSignComplete().then(r => {
                    if (r !== CONTRACT_TYPE.Done) {
                        if (roles.find(a => a === "ROLE_ACADEMY_MANAGER")) {
                            if (r === CONTRACT_TYPE.ContractAndCms || r === CONTRACT_TYPE.Contract) {
                                this.openModal('doSignModal');
                            } else if (r === CONTRACT_TYPE.Cms) {
                                this.openModal('doCmsSignModal');
                            }
                        } else if (roles.find(a => a === "ROLE_TEACHER")) {
                            this.openModal('nonSignAlertModal');
                        }
                    } else if (profile.academy.academyStatus === ACADEMY_STATUS.OVERDUE) {
                        if (roles.find(a => a === "ROLE_ACADEMY_MANAGER")) {
                            if (this.isManager()) {
                                this.openModal('doPaymentModal');
                            } else {
                                this.moveToPayment();
                            }
                        } else if (roles.find(a => a === "ROLE_TEACHER")) {
                            this.openModal('overDueAlertModal');
                        }
                    }
                });
            }


            if (roles.find(a => a === 'ROLE_TEACHER')) {
                if (this.props.history.location.pathname === '/teacher')
                    this.props.history.push('/teacher/openHomeworks');
            } else {
                this.props.history.push('/');
            }
        });

        window.historyPush = path => {
            this.props.history.push(path);
        };

        noticeService.fetchLatestNotice().then(latestNotices => {
            if (latestNotices && latestNotices.length > 0) {
                this.setState({latestNotices});
                console.log(latestNotices);
                this.openModal('noticeModal');
            }
        });
    }

    fetchAllList = () => {
        noticeService.fetchRecentNotice().then(recentNotices => {
            this.setState({recentNotices});
        });
    };

    expandNotice = notice => () => {
        let recentNotices = this.state.recentNotices.map(n => {
            if (n.id === notice.id)
                n.isExpanded = true;
            return n;
        });
        this.setState({recentNotices});
    };

    goToRoot = () => {
        window.location.href = '/';
    };

    goToPayment = () => {
        this.props.history.push('/academymanager/payment/open');
    };

    toggleSidebar = () => {
        this.setSidebarVisibility(!this.state.sidebarVisibility);
    };

    onClickBtn = () => {
        this.setSidebarVisibility(!this.state.sidebarVisibility);
    };

    hideSidebar = () => {
        this.setSidebarVisibility(false);
    };

    setSidebarVisibility = nextState => {
        this.setState({sidebarVisibility: nextState});
        if (nextState) this.setState({sidebarDisplay: 'block'});
        else setTimeout(() => {
            this.setState({sidebarDisplay: 'none'});
        }, 250);
    };

    openToad = () => {
        let openToad = token => {
            let url = `${TOAD_BASE_URL}/login/${token}`;
            if (toadWindow !== null && !toadWindow.closed) {
                toadWindow.close();
            }
            toadWindow = window.open(url, "popup-toad", "width=1080, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
            if (!toadWindow || toadWindow.closed || typeof toadWindow.closed === 'undefined') alert("화면이 나타나지 않을 경우 브라우저에서 팝업 차단을 해제해주세요");
        };
        this.props.fetchToadToken().then(openToad);
    };

    isManager = () => {
        if (loginService.hasAuthority("PREVIOUS_ADMINISTRATOR")) {
            this.setState({
                ...this.state,
                canClose: true,
            });
            return true;
        }
        return false
    };

    openModal = (modalName) => {
        this.setState({
            ...this.state,
            modal: {
                ...this.state.modal,
                [modalName]: true
            }
        })
    };

    closeModal = (modalName) => {
        if (this.state.canClose)
            this.setState({
                ...this.state,
                modal: {
                    ...this.state.modal,
                    [modalName]: false
                }
            })
    };

    forceCloseModal = modalName => {
        this.setState({
            ...this.state,
            modal: {
                ...this.state.modal,
                [modalName]: false
            }
        })
    };

    closeNoticeUntilNew = () => {
        this.forceCloseModal('noticeModal');
        setItem('noticeModal', {
            date: new Date()
        });
    };

    openContract = () => {
        loginService.refreshToken().then(r => {
            this.setState({isPopupBlocked: false});
            let token = loginService.getAccessToken();
            let url = `${SIGN_BASE_URL}/login/pocketmath/${token}`;
            let popup = window.open(url, "popup-toad", "width=1080, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
            if (!popup || popup.closed || typeof popup.closed === 'undefined') this.setState({isPopupBlocked: true, blockedPopUpUrl: url});
        })
    };

    moveToPayment = () => {
        this.props.history.push('/academymanager/payment');
    };

    goBack = () => {
        loginService.logout();
    };

    render() {
        return <div key="Teacher-root">
            <MadHeader logoSrc="/assets/images/logo.png" role={'teacher'}
                       roles={this.props.roles}
                       showSidebar={this.state.sidebarVisibility}
                       onClickBtn={this.onClickBtn}
                       user={this.props.user}
                       onClickLogo={this.goToRoot}
                       onClickPaidConversion={this.goToPayment}
                       onClickMenu={this.toggleSidebar}
                       location={this.props.history.location}
                       openToad={this.openToad}
                       openNotice={() => {
                           this.fetchAllList();
                           this.openModal('noticeModal');
                       }}/>
            <div className="hide-when-w-over-850" style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100vw',
                height: '100vh',
                background: 'black',
                opacity: this.state.sidebarVisibility ? 0.2 : 0,
                display: this.state.sidebarDisplay,
                transition: '0.2s opacity',
                zIndex: 1000,
            }} onClick={this.hideSidebar}/>
            <div className="container row" style={{marginTop: loginService.isSwitched() ? 24 + 64 + 32 : 24 + 64}}>
                <div className="column is-1 sidebar hide-when-w-850" style={{minWidth: 160}}>
                    <MadRoleSideBar roles={this.props.roles} openToad={this.openToad} location={this.props.history.location} isDevAcademy={this.props.isDevAcademy}/>
                </div>
                <div style={{width: '100%'}}>
                    <ErrorBoundary>
                        {this.props.routes}
                    </ErrorBoundary>
                </div>
            </div>

            <MadModal
                isOpen={this.state.modal['doSignModal']}
                onRequestClose={() => this.closeModal('doSignModal')}
                shouldCloseOnOverlayClick={false}
                size={'sm'}
                closeButton={this.isManager()}>
                <MadSubTitle>전자계약서 서명요청</MadSubTitle>
                <Gap size="normal"/>
                <p>전자계약서 서명이 필요한 학원입니다.</p>
                <p>지금 서명하면 바로 사용할 수 있습니다.</p>
                <Gap size="normal"/>
                <p>* 기타 문의사항은 본사 고객센터로 문의해 주세요. (1588-9034)</p>
                <Gap size="normal"/>
                <MadButton text={'전자계약서 서명하기'} size="fw" onClick={() => this.openContract()}/>
            </MadModal>

            <MadModal
                isOpen={this.state.modal['doCmsSignModal']}
                onRequestClose={() => this.closeModal('doCmsSignModal')}
                shouldCloseOnOverlayClick={false}
                size={'sm'}
                closeButton={this.isManager()}>
                <MadSubTitle>자동이체 동의서 서명요청</MadSubTitle>
                <Gap size="normal"/>
                <p>자동이체 동의서 서명이 필요한 학원입니다.</p>
                <p>지금 서명하면 바로 사용할 수 있습니다.</p>
                <Gap size="normal"/>
                <p>* 기타 문의사항은 본사 고객센터로 문의해 주세요. (1588-9034)</p>
                <Gap size="normal"/>
                <MadButton text={'자동이체 동의서 서명하기'} size="fw" onClick={() => this.openContract()}/>
            </MadModal>

            <MadModal
                isOpen={this.state.modal['nonSignAlertModal']}
                onRequestClose={() => this.closeModal('nonSignAlertModal')}
                shouldCloseOnOverlayClick={false}
                size={'sm'}
                closeButton={this.isManager()}>
                <MadSubTitle>계약서 서명요청</MadSubTitle>
                <Gap size="normal"/>
                <p>계약 절차를 마무리하지 않은 학원입니다.</p>
                <p>지금 서명하면 바로 사용할 수 있습니다.</p>
                <Gap size="normal"/>
                <p>* 기타 문의사항은 본사 고객센터로 문의해 주세요. (1588-9034)</p>
                <Gap size="normal"/>
                <MadButton text={'홈으로 이동'} size="fw" onClick={() => this.goBack()}/>
            </MadModal>

            <MadModal
                isOpen={this.state.modal['doPaymentModal']}
                onRequestClose={() => this.closeModal('doPaymentModal')}
                shouldCloseOnOverlayClick={false}
                size={'sm'}
                closeButton={this.isManager()}>
                <MadSubTitle>결제 요청</MadSubTitle>
                <Gap size="normal"/>
                <p>결제가 필요한 학원입니다.</p>
                <p>지금 결제하면 바로 사용할 수 있습니다.</p>
                <Gap size="normal"/>
                <p>* 기타 문의사항은 본사 고객센터로 문의해 주세요. (1588-9034)</p>
                <Gap size="normal"/>
                <MadButton text={'결제하기'} size="fw" onClick={() => this.moveToPayment()}/>
            </MadModal>

            <MadModal
                isOpen={this.state.modal['overDueAlertModal']}
                onRequestClose={() => this.closeModal('overDueAlertModal')}
                shouldCloseOnOverlayClick={false}
                size={'sm'}
                closeButton={this.isManager()}>
                <MadSubTitle>결제 요청</MadSubTitle>
                <Gap size="normal"/>
                <p>결제가 필요한 학원입니다.</p>
                <p>소속 학원 결제 담당자에게 문의해 주세요.</p>
                <Gap size="normal"/>
                <p>* 기타 문의사항은 본사 고객센터로 문의해 주세요. (1588-9034)</p>
                <Gap size="normal"/>
                <MadButton text={'홈으로 이동'} size="fw" onClick={() => this.goBack()}/>
            </MadModal>

            <MadModal
                isOpen={this.state.modal['disableAcademyModal']}
                onRequestClose={() => this.closeModal('disableAcademyModal')}
                shouldCloseOnOverlayClick={false}
                size={'sm'}
                closeButton={this.isManager()}>
                <MadSubTitle>사용중지 학원</MadSubTitle>
                <Gap size="normal"/>
                <p>더 이상 사용하지 않는 학원입니다.</p>
                <Gap size="normal"/>
                <p>* 기타 문의사항은 본사 고객센터로 문의해 주세요. (1588-9034)</p>
                <Gap size="normal"/>
                <MadButton text={'홈으로 이동'} size="fw" onClick={() => this.goBack()}/>
            </MadModal>

            <MadModal
                isOpen={this.state.modal['noticeModal']}
                size="normal"
                onRequestClose={() => this.forceCloseModal('noticeModal')}
                shouldCloseOnOverlayClick={true}
                closeButton={true}>
                <div className="notice-modal">
                    <h1>
                        🎉 공지사항 <MadButton ghost2 xs style={{verticalAlign: 'middle'}} onClick={this.fetchAllList}>전체 목록 보기</MadButton>
                    </h1>
                    <Gap xs/>
                    {
                        this.state.recentNotices &&
                        this.state.recentNotices.length > 0 &&
                        <div>
                            {
                                this.state.recentNotices.map(notice => {
                                    return <div className="notice-list-item">
                                        <h2>
                                            <span>{notice.title}</span>&nbsp;<MadTag size="micro" color="black"><MadLocalDateFormat localDate={notice.date}/></MadTag>
                                        </h2>
                                        {
                                            notice.isExpanded ?
                                                <div className="notice-content" dangerouslySetInnerHTML={{__html: notice.content}}/> :
                                                <React.Fragment>
                                                    <p className="excerpt" dangerouslySetInnerHTML={{__html: notice.excerpt}}/>
                                                    <MadButton ghost2 xs style={{verticalAlign: 'middle'}} onClick={this.expandNotice(notice)}>더보기</MadButton>
                                                </React.Fragment>
                                        }
                                        <Gap line/>
                                    </div>
                                })
                            }
                        </div>
                    }
                    {
                        this.state.recentNotices.length === 0 &&
                        this.state.latestNotices &&
                        this.state.latestNotices.length > 0 &&
                        this.state.latestNotices.map(notice => {
                            return <div key={notice.id}>
                                <h2>
                                    <MadTag size="micro" color="black"><MadLocalDateFormat localDate={notice.date}/></MadTag>
                                    <span style={{display: 'block', margin: '8px 0'}}>{notice.title}</span>
                                </h2>
                                <div className="notice-content" dangerouslySetInnerHTML={{__html: notice.content}}/>
                                <Gap line/>
                            </div>
                        })
                    }
                </div>
                <div style={{textAlign: 'right'}}>
                    <MadButton secondary xs onClick={() => this.closeNoticeUntilNew()}>다시 보지 않기</MadButton>
                </div>
            </MadModal>
        </div>
    }
};
