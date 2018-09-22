import React, {PureComponent} from 'react';
import DocumentTitle from 'react-document-title';
import ReactGA from 'react-ga';
import './OpenHomework.scss';
import CreateOpenHomework from './CreateOpenHomework';
import HomeworkDetail from '../../components/HomeworkDetail';
import ManageStudentsList from '../../components/ManageStudentsList';
import {
    MadSubTitle,
    MadButton,
    MadModal,
    Gap,
    MadLoadingView,
    AnswerTable,
    MadLocalDateFormat,
    MadDropdown,
    MadPieChart,
    MadBarChart,
    MadTooltip,
} from 'madComponents';

const styles = {
    // overflow: 'scroll',
    // height: `calc(100vh - ${325}px)`
};
export default class OpenHomework extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            modal: {},
            progress: {},
        };
    }

    componentDidMount() {
        ReactGA.pageview('createOpenHomework');
        this.props.fetchOpenHomeworks();
        this.props.fetchLearningStats();
    }

    openModal = name => {
        this.setState({modal: {...this.state.modal, [name]: true}})
    };

    closeModal = name => {
        this.setState({modal: {...this.state.modal, [name]: false}})
    };

    activateProgress = name => {
        this.setState({progress: {...this.state.progress, [name]: true}})
    };

    deactivateProgress = name => {
        this.setState({progress: {...this.state.progress, [name]: false}})
    };

    openCreateOpenHomeworkModal = () => {
        this.openModal('createOpenHomework');
    };

    createOpenHomework = params => {
        return this.props.createOpenHomework(params);
    };

    openLearningStatus = learning => e => {
        this.openModal('learningStatus');
        this.props.fetchOpenHomeworkLearnings(learning.id);
    };

    closeLearningStatus = () => {
        this.closeModal('learningStatus');
    };

    openPopUpUrl = () => {
        this.setState({isPopupBlocked: false});
        window.open(this.state.blockedPopUpUrl, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
    };

    openPrint = assign => e => {
        this.setState({isPopupBlocked: false});
        let url = `/print/openHomework/${assign.id}/`;
        let popup = window.open(url, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
        if (!popup || popup.closed || typeof popup.closed === 'undefined') this.setState({isPopupBlocked: true, blockedPopUpUrl: url});
    };

    openLearningsPrint = assign => e => {
        this.setState({isPopupBlocked: false});
        let url = `/print/openHomework/${assign.id}/learnings`;
        let popup = window.open(url, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
        if (!popup || popup.closed || typeof popup.closed === 'undefined') this.setState({isPopupBlocked: true, blockedPopUpUrl: url});

    };

    openHomeworkDetail = openHomework => e => {
        this.props.setOpenHomework(openHomework).then(r => {
            this.openModal('openHomeworkDetail');
        });
    };

    openModifyStudent = (openHomework) => {
        if (openHomework) this.props.setOpenHomework(openHomework).then(r => {
            this.openModal('modifyStudent');
        });
        else this.openModal('modifyStudent');
    };

    studentFilter = student => {
        return !this.props.openHomework.students.find(s => {
            return s.id === student.id;
        });
    };

    modifyStudent = student => () => {
        this.activateProgress('modifyStudent');
        if (this.props.openHomework.students.filter(s => s.id === student.id).length === 0) {
            this.addStudentsToOpenHomework(this.props.openHomework.id, [student.id]);
        } else {
            this.removeStudentsToOpenHomework(this.props.openHomework.id, [student.id]);
        }
    };

    addStudentsToOpenHomework(homeworkId, studentId) {
        this.props.addStudentsToOpenHomework(homeworkId, studentId).then(() => this.deactivateProgress('modifyStudent'));
    };

    removeStudentsToOpenHomework(homeworkId, studentId) {
        this.props.removeStudentsToOpenHomework(homeworkId, studentId).then(() => this.deactivateProgress('modifyStudent'));
    };

    openHomeworkLearningAnswer = (learning) => {
        this.openModal('openHomeworkAnswer');
        this.props.setPropsLearning(learning);
    };

    submitAnswer = (learningId, userAnswers) => {
        this.activateProgress('submitAnswer');
        this.props.submitAnswer(learningId, userAnswers).then(() => {
            this.deactivateProgress('submitAnswer');
            this.closeModal('openHomeworkAnswer')
        });
    };

    resetLearning = (learningId) => {
        this.activateProgress('resetLearning');
        this.props.resetLearning(learningId).then(() => this.deactivateProgress('resetLearning'));
    };

    groupByTeacher = openHomeworkAssign => {
        return openHomeworkAssign.teacher.id;
    };

    loadMore = () => {
        this.props.fetchMoreOpenHomeworks();
    };

    render() {
        let {
            learningStats,
            openHomeworks
        } = this.props;
        return (
            <DocumentTitle title='문제은행 Beta'>
                <div style={{position: 'relative'}}>
                    <div className="row">
                        <div className="column is-flex flex-3" style={{alignItems: 'baseline'}}>
                            <h2 className="mad-title-h2">문제은행<sup style={{color: '#e8496a'}}>beta</sup></h2>
                            {
                                learningStats &&
                                <React.Fragment>
                                    <MadTooltip overlay="문제은행과 수업 과제 그리고 진단평가에서 출제한 총 문항수 입니다">
                                        <span style={{color: 'gray', marginLeft: 16, cursor: 'help'}}>이번달 사용량 <i className="mdi mdi-help-circle-outline"/></span>
                                    </MadTooltip>
                                    <MadBarChart deActivate value={learningStats.current} max={learningStats.limit} measure="" style={{width: 100, height: 8, fontSize: 0, margin: '0 8px'}}/>
                                    <span style={{color: 'gray'}}>{learningStats.current}/{learningStats.limit}</span>
                                </React.Fragment>
                            }
                        </div>
                        <div className="column is-flex is-flex-pull-right">
                            {
                                learningStats &&
                                <React.Fragment>
                                    {
                                        learningStats.status === 'UNDER' &&
                                        <MadButton text="문제지 만들기" onClick={() => this.openCreateOpenHomeworkModal()} xs disabled={learningStats.status === 'OVER'}/>
                                    }
                                    {
                                        learningStats.status === 'OVER' &&
                                        <MadTooltip overlay={<p style={{margin: 0}}>
                                            최대 문항 출제 한도를 초과하였습니다.<br/>
                                            더 많은 문항 출제를 원하시면 요금제를 변경해 주십시오.<br/>
                                            요금제 변경은 1588-9034로 연락주시기 바랍니다.
                                        </p>}>
                                            <MadButton text="문제지 만들기" xs disabled={learningStats.status === 'OVER'}/>
                                        </MadTooltip>
                                    }
                                </React.Fragment>
                            }
                        </div>
                    </div>
                    <Gap sm/>
                    {
                        openHomeworks && openHomeworks.length === 0 &&
                        <div className="row">
                            <div className="column is-12 center">
                                <p>생성된 문제지가 없습니다</p>
                                <p>문제지를 만들어보세요</p>
                                <MadButton text="문제지 만들기" onClick={() => this.openCreateOpenHomeworkModal()} xs/>
                            </div>
                        </div>
                    }
                    {
                        openHomeworks && openHomeworks.length > 0 &&
                        <div className="card" style={styles}>
                            <div className="row">
                                <p style={{
                                    color: 'white',
                                    background: '#ff6f00',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    marginTop: 0,
                                    width: '100%',
                                }}>학생 채점용 QR을 통해 학생이 학습에 직접 참여해 답안을 제출 할 수 있습니다.</p>
                            </div>
                            <div className="row">
                                {
                                    this.state.isPopupBlocked &&
                                    <p style={{
                                        color: 'white',
                                        background: '#ff6f00',
                                        padding: '6px',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        marginTop: 0,
                                        width: '100%',
                                        cursor: 'pointer'
                                    }} onClick={this.openPopUpUrl}>출력 화면이 나타나지 않을 경우 브라우저에서 팝업 차단을 해제해주세요</p>
                                }
                            </div>
                            {
                                openHomeworks === null &&
                                <MadLoadingView showText={true}/>
                            }
                            {
                                Object.entries(openHomeworks.groupBy(this.groupByTeacher))
                                    .flatMap(([teacherId, openHomeworks]) => {
                                        return <div className="row">
                                            <div className="column is-12">
                                                <div key={teacherId} className="openhomework-list-group-header">
                                                    <span>{`${openHomeworks[0].teacher.nickname}님이 출제한 문제지 - ${openHomeworks.length}개`}</span>
                                                </div>
                                                <div className="row homework-list-item is-gapless is-vcentered bottom-line-light simple-list-item">
                                                    <div className="column is-2 padding-cell">문제지 진행일</div>
                                                    <div className="column is-4 padding-cell">문제지명</div>
                                                    <div className="column is-2 padding-cell">수강학생</div>
                                                    <div className="column is-4 is-flex is-vcentered padding-cell"/>
                                                </div>
                                                {
                                                    openHomeworks && openHomeworks.length > 0 && openHomeworks.map(openHomework => {
                                                        return <OpenHomeworkListItem key={`c${openHomework.id}`}
                                                                                     openHomework={openHomework}
                                                                                     openLearningStatus={this.openLearningStatus}
                                                                                     openPrint={this.openPrint}
                                                                                     openLearningsPrint={this.openLearningsPrint}
                                                                                     openHomeworkDetail={this.openHomeworkDetail}
                                                                                     deleteOpenHomework={this.props.deleteOpenHomework}
                                                                                     openModifyStudent={this.openModifyStudent}/>
                                                    })
                                                }
                                            </div>
                                        </div>
                                    })
                            }
                            {
                                !this.props.isPageEnd &&
                                <MadButton text="더보기" onClick={this.loadMore} secondary fw/>
                            }
                        </div>
                    }
                    {
                        this.state.modal['openHomeworkDetail'] &&
                        <MadModal
                            isOpen={this.state.modal['openHomeworkDetail']}
                            shouldCloseOnOverlayClick={false}
                            size={'sm'}
                            onRequestClose={() => this.closeModal('openHomeworkDetail')}
                            closeButton={true}>
                            <div>
                                <MadSubTitle>문제지 구성</MadSubTitle>
                                <Gap/>
                                <HomeworkDetail homework={this.props.openHomework}
                                                leafChapters={this.props.leafChapters}
                                                openModifyStudent={this.openModifyStudent}/>
                                <div className="row">
                                    <div className="column is-12">
                                        <div className="column is-flex is-hcentered">
                                            <MadButton text="닫기" onClick={() => this.closeModal('openHomeworkDetail')}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </MadModal>
                    }
                    {
                        this.state.modal['modifyStudent'] &&
                        <MadModal
                            isOpen={this.state.modal['modifyStudent']}
                            shouldCloseOnOverlayClick={false}
                            size={'sm'}
                            onRequestClose={() => this.closeModal('modifyStudent')}
                            closeButton={true}>
                            <div>
                                <ManageStudentsList
                                    students={this.props.students}
                                    title={'참여학생 변경'}
                                    filter={this.studentFilter}
                                    onActionButtonClick={this.modifyStudent}
                                    emptyListText="해당하는 학생이 없습니다"
                                    loadingInProgress={this.state.progress['modifyStudent']}/>
                            </div>
                            <div className="column is-12 is-flex">
                                <div className="column is-flex is-hcentered">
                                    <MadButton text="닫기" size={'normal'} onClick={() => this.closeModal('modifyStudent')}/>
                                </div>
                            </div>
                        </MadModal>
                    }
                    {
                        this.state.modal['createOpenHomework'] &&
                        <CreateOpenHomework createOpenHomework={this.createOpenHomework}
                                            fetchTopChapters={this.props.fetchTopChapters}
                                            fetchOpenHomeworkCandidates={this.props.fetchOpenHomeworkCandidates}
                                            chapters={this.props.chapters}
                                            candidates={this.props.candidates}
                                            fetchSchoolBooks={this.props.fetchSchoolBooks}
                                            schoolBooks={this.props.schoolBooks}
                                            modal={this.state.modal}
                                            closeModal={this.closeModal}
                                            openPrint={this.openPrint}/>
                    }
                    {
                        this.state.modal['learningStatus'] &&
                        <MadModal
                            isOpen={this.state.modal['learningStatus']}
                            shouldCloseOnOverlayClick={false}
                            size={'sm'}
                            onRequestClose={() => this.closeLearningStatus()}
                            closeButton={true}>
                            <OpenHomeworkLearningStatus openHomeworkLearnings={this.props.learnings}
                                                        openHomeworkLearningAnswer={this.openHomeworkLearningAnswer}/>
                        </MadModal>
                    }
                    {
                        this.state.modal['openHomeworkAnswer'] &&
                        <MadModal className="select-page-modal"
                                  isOpen={this.state.modal['openHomeworkAnswer']}
                                  size={'lg'}
                                  onRequestClose={() => this.closeModal('openHomeworkAnswer')}
                                  shouldCloseOnOverlayClick={false}
                                  closeButton={true}>
                            {
                                this.state.homeworkAnswer !== null &&
                                <div>
                                    <AnswerTable learning={this.props.learning}
                                                 submitAnswer={this.submitAnswer}
                                                 resetLearning={this.resetLearning}
                                                 loadingInProgress={this.state.progress['answerLoading']}
                                                 submitInProgress={this.state.progress['submitAnswer']}
                                                 resetLearningInProgress={this.state.progress['resetLearningInProgress']}/>
                                </div>
                            }
                        </MadModal>
                    }
                </div>
            </DocumentTitle>);
    }
};

class OpenHomeworkLearningStatus extends PureComponent {

    openHomeworkLearningAnswer = (learning) => {
        this.props.openHomeworkLearningAnswer(learning);
    };

    homeworkPercent = learning => {
        return learning.score;
    };

    render() {
        const {
            openHomeworkLearnings,
        } = this.props;
        return <div>
            <MadSubTitle>학습 상태</MadSubTitle>
            <Gap/>
            {
                openHomeworkLearnings &&
                openHomeworkLearnings.length > 0 &&
                openHomeworkLearnings.map((l, i) => {
                    return (
                        <div className="row is-gapless is-vcentered bottom-line-light simple-list-item"
                             style={i === 0 ? {borderTop: '1px solid black'} : {}}
                             key={`st-${l.id}`}>
                            <div className="column is-2 padding-cell" style={{textAlign: 'left'}}>
                                <MadPieChart value={this.homeworkPercent(l)} measure={'점'} deActivate={l.userAnswers === null} style={{marginRight: 16}}/>
                            </div>
                            <div className="column is-7 padding-cell" style={{textAlign: 'left'}}>
                                {l.student.nickname}
                            </div>
                            <div className="column is-3 padding-cell" style={{textAlign: 'right'}}>
                                <MadButton text="채점" xs ghost onClick={() => this.openHomeworkLearningAnswer(l)}/>
                            </div>
                        </div>
                    );
                })
            }
            {
                openHomeworkLearnings &&
                openHomeworkLearnings.length === 0 &&
                <span className="font-color-text-light">학생이 없습니다</span>
            }
            {
                !openHomeworkLearnings &&
                <div className="column is-12">
                    <MadLoadingView showText={true}/>
                </div>
            }

        </div>
    }
}

class OpenHomeworkListItem extends PureComponent {
    deleteOpenHomework = homeworkAssign => e => {
        if (confirm(`"${homeworkAssign.title}" 문제지를 삭제합니다`)) {
            this.props.deleteOpenHomework(homeworkAssign.id)
                .then(() => {
                    alert("삭제되었습니다");
                })
                .catch(() => {
                    alert("삭제하지 못했습니다");
                });
        }
    };

    render() {
        const {
            openHomework,
            openLearningStatus,
            openPrint,
            openLearningsPrint,
            openHomeworkDetail,
            openModifyStudent
        } = this.props;
        let createdText = '';
        if (openHomework.createdDate) {
            let termText = new Date(openHomework.createdDate).termText();
            if (termText[2] <= 2) createdText = `${termText[0]}${termText[1]}`
        }

        return <div key={openHomework.id} className="row homework-list-item is-gapless is-vcentered bottom-line-light simple-list-item">
            <div className="column is-2 small-padding-cell">
                <MadLocalDateFormat range={true} startLocalDate={openHomework.startDate} endLocalDate={openHomework.endDate}/>
            </div>
            <div className="column is-4 padding-cell">
                {
                    createdText &&
                    <span style={{color: '#ff6633', fontSize: '0.7em', display: 'block'}}>{createdText}&nbsp;출제</span>
                }
                {openHomework.title}
            </div>
            <div className="column is-2 padding-cell">
                <MadButton ghost xs onClick={e => {
                    openModifyStudent(openHomework)
                }}>
                    {
                        openHomework.students.length === 0 && <span className="font-color-text-light">+ 학생 추가</span>
                    }
                    {
                        openHomework.students.length === 1 && `${openHomework.students[0].nickname}`
                    }
                    {
                        openHomework.students.length > 1 && `${openHomework.students[0].nickname}외 ${openHomework.students.length - 1}명`
                    }
                </MadButton>
            </div>
            <div className="column is-4 is-flex is-vcentered padding-cell" style={{justifyContent: 'space-around'}}>
                <MadDropdown>
                    <MadButton text="출력" sm ghost/>
                    <li onClick={openPrint(openHomework)}>공통 문제지 출력</li>
                    {
                        openHomework.students.length > 0 &&
                        <li onClick={openLearningsPrint(openHomework)}>참여 학생별 출력</li>
                    }
                </MadDropdown>
                <MadButton text="학습상태" sm ghost onClick={openLearningStatus(openHomework)}/>
                <MadDropdown alignRight>
                    <MadButton icon="dots-vertical" sm ghost2 square style={{color: '#757575'}}/>
                    <li onClick={openHomeworkDetail(openHomework)}>구성</li>
                    <li onClick={this.deleteOpenHomework(openHomework)} className="danger">삭제</li>
                </MadDropdown>
            </div>
        </div>
    }
}
