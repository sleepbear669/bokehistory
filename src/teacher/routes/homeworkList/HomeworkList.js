import React, {PureComponent} from 'react';
import DocumentTitle from 'react-document-title';
import ReactGA from 'react-ga';
import './HomeworkList.scss';
import {
    MadSubTitle,
    MadButton,
    MadModal,
    Gap,
    MadPieChart,
    MadLoadingView,
    AnswerTable,
    MadPanel,
    MadPanelNav,
    MadPanelContents,
    MadLocalDateFormat,
    MadDropdown,
    MadTooltip,
    MadBarChart,
} from 'madComponents';

import ManageStudentList from '../../components/ManageStudentsList';
import HomeworkCreateModal from '../../components/HomeworkCreateModal';

const styles = {
    overflow: 'scroll',
    overflowX: 'visible',
    height: `calc(100vh - ${325}px)`
};
export default class HomeworkList extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            courseNotFound: false,
            textbookDetailNotFound: false,
            homeworkAnswer: null,
            courseStudents: this.props.course && this.props.course.students || [],
            textbookDetail: this.props.textbookDetail || {},
            textbookDetailByChapterName: this.props.textbookDetailByChapterName || {},
            homeworkLearnings: [],
            progress: {},
            isPopupBlocked: false,
            inputPages: "",
            inputPagesError: false,
            modal: {},
            homeworkDetail: this.props.homeworkDetail || null,
        };
    }

    componentDidMount() {
        this.fetchHomeworks();
        this.props.fetchLearningStats();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            homeworkList: nextProps.homeworkList || '',
            homeworkDetail: nextProps.homeworkDetail || null,
            courseStudents: nextProps.course && nextProps.course.students || '',
            textbookDetail: nextProps.textbookDetail || {},
            textbookDetailByChapterName: nextProps.textbookDetailByChapterName || {},
        });
        if (nextProps.chapters === null && nextProps.textbookDetail !== null) {
            this.props.fetchTopChapters();
        }
    }

    fetchHomework(homeworkId) {
        this.props.fetchHomework(homeworkId).then(r => {
            this.deactivateProgress('modifyStudent');
        });
    }

    fetchHomeworks() {
        this.activateProgress("homeworkListLoading");
        return this.props.fetchHomeworks(this.props.match.params.id).then(r => {
            this.deactivateProgress("homeworkListLoading");
            return r;
        });
    }

    courseFilter = student => {
        return !this.state.homeworkDetail.students.find(s => {
            return s.id === student.id;
        });
    };

    modifyStudent = student => () => {
        this.activateProgress('modifyStudent');
        if (this.state.homeworkDetail.students.filter(s => s.id === student.id).length === 0) {
            this.addStudentsToHomework(this.state.homeworkDetail.id, [student.id]);
        } else {
            this.removeStudentsToHomework(this.state.homeworkDetail.id, [student.id]);
        }
    };

    addStudentsToHomework(homeworkId, studentId) {
        this.props.addStudentsToHomework(homeworkId, studentId).then(r => {
            this.props.createHomeworkLearnings(homeworkId, studentId).then(r => {
                this.fetchHomework(homeworkId);
            })
        });
    };

    removeStudentsToHomework(homeworkId, studentId) {
        this.props.removeStudentsToHomework(homeworkId, studentId).then(r => {
            this.fetchHomework(homeworkId);
        });
    };

    async fetchHomeworkLearnings(homeworkId) {
        this.setState({
            homeworkLearnings: null,
        });
        this.activateProgress('answerLoading');
        return await this.props.fetchHomeworkLearnings(homeworkId).then(r => {
            this.deactivateProgress('answerLoading');
            this.setState({
                homeworkLearnings: r,
            });
            return r;
        })
    }

    homeworkPercent = learning => {
        return learning.score;
    };

    activateProgress = progressName => {
        this.setState({
            progress: {
                ...this.state.progress,
                [progressName]: true,
            }
        });
    };

    deactivateProgress = progressName => {
        this.setState({
            progress: {
                ...this.state.progress,
                [progressName]: false,
            }
        });
    };

    openModalWrapper = (modalName, ...args) => e => {
        this.openModal(modalName, ...args);

        modalName === "homeworkDetail" && this.setForm('homeworkDetail', args[0]);
        e.stopPropagation();
        e.preventDefault();

        ReactGA.modalview(modalName);
    };

    openModal = (modalName, ...args) => {
        this.setState({
            modal: {
                ...this.state.modal,
                [modalName]: true,
            }
        });

        modalName === "createHomework" && this.props.fetchTopChapters();
        modalName === "homework" && this.fetchHomeworkLearnings(args[0].id);
        modalName === "homework" && this.setForm("homework", args[0]);
        modalName === "homeworkAnswer" && this.setForm('homeworkAnswer', args[0]);

        ReactGA.modalview(modalName);
    };

    closeModal = modalName => {
        this.setState({
            modal: {
                ...this.state.modal,
                [modalName]: false,
            },
        });

        modalName === "selectUnits" && this.setState({trashs: []});
        modalName === "createHomework" && this.fetchHomeworks();
        modalName === "homeworkDetail" && this.fetchHomeworks();
    };

    setForm = (name, form) => {
        let setForm = {};
        Object.keys(form).forEach(f => {
            setForm[f] = form[f] || "";
        });
        this.setState({
            [name]: setForm
        });
    };

    submitAnswer = (learningId, userAnswers) => {
        this.activateProgress('submitAnswer');
        this.props.submitAnswer(learningId, userAnswers).then(r => {
            if (r) {
                this.deactivateProgress('submitAnswer');
                this.fetchHomeworkLearnings(this.state.homework.id);
            } else {
                alert("답안 제출에 실패했습니다");
                this.deactivateProgress('submitAnswer');
            }
            this.closeModal('homeworkAnswer');
        });
    };

    resetLearning = (learningId) => {
        this.activateProgress('resetLearning');
        this.props.resetLearning(learningId)
            .then(r => {
                if (r.success) {
                    this.fetchHomeworkLearnings(this.state.homework.id).then(r => {
                        this.setState({
                            homeworkAnswer: r.find(r => r.id === learningId)
                        });
                    });
                } else {
                    alert("초기화에 실패했습니다.");
                }
                this.deactivateProgress('resetLearning');
            })
            .catch(e => {
                alert("초기화에 실패했습니다.");
                this.deactivateProgress('resetLearning')
            });
    };

    openPrint = assign => e => {
        this.setState({isPopupBlocked: false});
        let url = `/print/homework/${assign.id}/`;
        let popup = window.open(url, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
        if (!popup || popup.closed || typeof popup.closed === 'undefined') this.setState({isPopupBlocked: true, blockedPopUpUrl: url});

        e.preventDefault();
        e.stopPropagation();
    };

    deleteHomework = homeworkAssign => e => {
        if (confirm(`"${homeworkAssign.title}" 과제를 삭제합니다`)) {
            this.props.deleteHomework(homeworkAssign.id)
                .then(r => {
                    alert("삭제되었습니다");
                })
                .catch(e => {
                    alert("삭제하지 못했습니다");
                });
        }
    };

    createHomeworkLearnings(homeworkAssign) {
        homeworkAssign.students.map(student => {
            this.props.createHomeworkLearnings(homeworkAssign.id, student.id).then(r => {
            })
        })
    }

    openPopUpUrl = () => {
        this.setState({isPopupBlocked: false});
        window.open(this.state.blockedPopUpUrl, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
    };

    getChapterNames = () => {
        return this.props.chapters
            .map(chapter => chapter.leafChapters.filter(lc => this.state.homeworkDetail.leafChapterIds.includes(lc.contentId)).map(lc => lc))
            .reduce((a, b) => [...a, ...b]);

    };

    createHomework = params => {
        return this.props.createHomework(params).then(r => {
            this.props.fetchLearningStats();
            return r;
        });
    };

    render() {
        const {
            homeworkList,
            learningStats,
        } = this.props;

        return (
            <DocumentTitle title='수업 - 과제'>
                <div className="row">
                    <div className="card column is-12">
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
                        <div className="row" style={{marginTop: 0}}>
                            <div className="column is-flex" style={{alignItems: 'baseline'}}>
                                <MadSubTitle text={'과제 목록'}/>
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
                                            <MadButton text="과제 만들기" isLoading={this.state.progress['textbookLoading']} onClick={() => this.openModal('createHomework')} xs/>
                                        }
                                        {
                                            learningStats.status === 'OVER' &&
                                            <MadTooltip overlay={<p style={{margin: 0}}>
                                                최대 문항 출제 한도를 초과하였습니다<br/>
                                                더 많은 문항 출제를 원하시면 요금제를 변경해 주십시오.<br/>
                                                요금제 변경은 1588-9034로 연락주시기 바랍니다.
                                            </p>}>
                                                <MadButton text="과제 만들기" xs disabled/>
                                            </MadTooltip>
                                        }
                                    </React.Fragment>
                                }
                            </div>
                        </div>
                        <div className="row" style={{
                            height: `calc(100vh - 250px)`,
                            overflow: 'hidden',
                        }}>
                            <div className="column is-12">
                                <div>
                                    {homeworkList !== null && homeworkList.length !== 0 &&
                                    <div>
                                        <div className="row is-gapless is-vcentered bottom-line simple-list-header"
                                             style={{fontSize: '15px'}}>
                                            <div className="column is-2 padding-cell" style={{textAlign: 'left'}}>과제 진행일</div>
                                            <div className="column is-5 padding-cell" style={{textAlign: 'left'}}>과제명</div>
                                            <div className="column is-2 padding-cell" style={{textAlign: 'left'}}>수강학생</div>
                                            <div className="column is-3 padding-cell" style={{textAlign: 'center'}}></div>
                                        </div>
                                        <div style={styles}>
                                            {
                                                homeworkList.map(homework => (<HomeworkListItem
                                                    key={homework.id}
                                                    homework={homework}
                                                    openModalWrapper={this.openModalWrapper}
                                                    openPrint={this.openPrint}
                                                    deleteHomework={this.deleteHomework}
                                                />))
                                            }
                                            {
                                                this.state.progress['homeworkListLoading'] &&
                                                <MadLoadingView showText={false}/>
                                            }
                                        </div>
                                    </div>
                                    }
                                    {
                                        homeworkList === null &&
                                        <MadLoadingView showText={true}/>
                                    }
                                    {
                                        homeworkList !== null && homeworkList.length === 0 &&
                                        <div className="column is-12 center" style={styles}>
                                            <p>진행중인 과제가 없습니다</p>
                                            <p>과제를 만들어보세요</p>
                                            <MadButton text="과제 만들기" isLoading={this.state.progress['textbookLoading']} onClick={() => this.openModal('createHomework')} xs/>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>

                        {
                            this.state.modal['homework'] &&
                            <MadModal className="select-page-modal"
                                      isOpen={this.state.modal['homework']}
                                      size={'sm'}
                                      onRequestClose={() => this.closeModal('homework')}
                                      shouldCloseOnOverlayClick={true}
                                      closeButton={true}>
                                <MadSubTitle>수강 학생</MadSubTitle>
                                <Gap sm/>
                                {
                                    this.state.homeworkLearnings &&
                                    this.state.homeworkLearnings.length > 0 &&
                                    this.state.homeworkLearnings.map((h, i) => {
                                        return (
                                            <div className="row is-gapless is-vcentered bottom-line-light simple-list-item"
                                                 style={i === 0 ? {borderTop: '1px solid black'} : {}}
                                                 key={`st-${i}`}>
                                                <div className="column is-2 padding-cell" style={{textAlign: 'left'}}>
                                                    <MadPieChart value={this.homeworkPercent(h)} measure={'점'} deActivate={h.userAnswers === null} style={{marginRight: 16}}/>
                                                </div>
                                                <div className="column is-7 padding-cell" style={{textAlign: 'left'}}>
                                                    {h.student.nickname}
                                                </div>
                                                <div className="column is-3 padding-cell" style={{textAlign: 'right'}}>
                                                    <MadButton text="채점" xs ghost
                                                               onClick={() => this.openModal('homeworkAnswer', h)}/>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                                {
                                    this.state.homeworkLearnings &&
                                    this.state.homeworkLearnings.length === 0 &&
                                    <span className="font-color-text-light">학생이 없습니다</span>
                                }
                                {
                                    !this.state.homeworkLearnings &&
                                    <div className="column is-12">
                                        <MadLoadingView showText={true}/>
                                    </div>
                                }
                            </MadModal>
                        }
                        {
                            this.state.modal['homeworkAnswer'] &&
                            <MadModal className="select-page-modal"
                                      isOpen={this.state.modal['homeworkAnswer']}
                                      size={'lg'}
                                      onRequestClose={() => this.closeModal('homeworkAnswer')}
                                      shouldCloseOnOverlayClick={false}
                                      closeButton={true}>
                                {
                                    this.state.homeworkAnswer !== null &&
                                    <div>
                                        <AnswerTable learning={this.state.homeworkAnswer}
                                                     submitAnswer={this.submitAnswer}
                                                     resetLearning={this.resetLearning}
                                                     loadingInProgress={this.state.progress['answerLoading']}
                                                     submitInProgress={this.state.progress['submitAnswer']}
                                                     resetLearningInProgress={this.state.progress['resetLearningInProgress']}/>
                                    </div>
                                }
                            </MadModal>
                        }
                        {
                            this.state.modal['homeworkDetail'] &&
                            <MadModal
                                isOpen={this.state.modal['homeworkDetail']}
                                shouldCloseOnOverlayClick={false}
                                size={'sm'}
                                onRequestClose={() => this.closeModal('homeworkDetail')}
                                closeButton={true}>
                                <div>
                                    <MadSubTitle>과제 구성</MadSubTitle>
                                    <Gap/>
                                    {
                                        this.state.homeworkDetail &&
                                        <div>
                                            <div className="row is-gapless is-vcentered bottom-line-light simple-list-item"
                                                 style={{borderTop: '1px solid black'}}>
                                                <div className="column is-3 padding-cell" style={{textAlign: 'left'}}>
                                                    과제명
                                                </div>
                                                <div className="column is-9 padding-cell" style={{textAlign: 'right'}}>
                                                    {this.state.homeworkDetail.title}
                                                </div>
                                            </div>
                                            <div className="row is-gapless is-vcentered bottom-line-light simple-list-item">
                                                <div className="column is-3 padding-cell" style={{textAlign: 'left'}}>
                                                    과제 진행일
                                                </div>
                                                <div className="column is-9 padding-cell" style={{textAlign: 'right'}}>
                                                    <MadLocalDateFormat
                                                        range={true}
                                                        startLocalDate={this.state.homeworkDetail.startDate}
                                                        endLocalDate={this.state.homeworkDetail.endDate}
                                                        format={'YYYY.MM.DD'}/>
                                                </div>
                                            </div>
                                            <div className="row is-gapless is-vcentered bottom-line-light simple-list-item">
                                                <div className="column is-3 padding-cell" style={{textAlign: 'left'}}>
                                                    문항수
                                                </div>
                                                <div className="column is-9 padding-cell" style={{textAlign: 'right'}}>
                                                    {this.state.homeworkDetail.totalUnitCount}개
                                                </div>
                                            </div>
                                            <div className="row is-gapless is-vcentered bottom-line-light simple-list-item">
                                                <div className="column is-3 padding-cell" style={{textAlign: 'left'}}>
                                                    참여 학생
                                                </div>
                                                <div className="column is-9 padding-cell" style={{textAlign: 'right'}}>
                                                    {
                                                        this.state.homeworkDetail.students.length > 0 &&
                                                        <MadPanel align={'right'} deactivate={this.state.homeworkDetail.students.length <= 1}>
                                                            <MadPanelNav>
                                                                {this.state.homeworkDetail.students[0].nickname} 외 {this.state.homeworkDetail.students.length - 1}명
                                                            </MadPanelNav>
                                                            <MadPanelContents style={{padding: '6px 0'}}>
                                                                {
                                                                    this.state.homeworkDetail.students.map(s => <div key={`s-${s.id}`}>{s.nickname}</div>)
                                                                }
                                                            </MadPanelContents>
                                                        </MadPanel>
                                                    }
                                                    {
                                                        this.state.homeworkDetail.students.length === 0 &&
                                                        <span className="font-color-text-light">학생이 없습니다</span>
                                                    }
                                                    <MadButton text="참여학생 변경" ghost xs onClick={() => this.openModal('modifyStudent')}/>
                                                </div>
                                            </div>
                                            {
                                                this.state.homeworkDetail.textbookPages && this.state.homeworkDetail.textbookPages.length > 0 &&
                                                <div className="row is-gapless is-vcentered bottom-line-light simple-list-item">
                                                    <div className="column is-3 padding-cell" style={{textAlign: 'left'}}>
                                                        선택된 페이지
                                                    </div>
                                                    <div className="column is-9 padding-cell" style={{textAlign: 'right'}}>
                                                        <MadPanel align={'right'} deactivate={this.state.homeworkDetail.textbookPages.length <= 1}>
                                                            <MadPanelNav>
                                                                p.{this.state.homeworkDetail.textbookPages[0].pageNumber} 외 {this.state.homeworkDetail.textbookPages.length - 1}페이지
                                                            </MadPanelNav>
                                                            <MadPanelContents style={{padding: '6px 0'}}>
                                                                {
                                                                    this.state.homeworkDetail.textbookPages.map(t => <div key={`tp-${t.id}`}>{'p.' + t.pageNumber}</div>)
                                                                }
                                                            </MadPanelContents>
                                                        </MadPanel>
                                                    </div>
                                                </div>
                                            }
                                            {
                                                this.state.homeworkDetail.leafChapterIds && this.state.homeworkDetail.leafChapterIds.length > 0 && this.props.chapters &&
                                                <div className="row is-gapless is-vcentered bottom-line-light simple-list-item">
                                                    <div className="column is-3 padding-cell" style={{textAlign: 'left'}}>
                                                        선택된 단원
                                                    </div>
                                                    <div className="column is-9 padding-cell" style={{textAlign: 'right'}}>
                                                        <MadPanel align={'right'} deactivate={this.state.homeworkDetail.leafChapterIds.length <= 1}>
                                                            <MadPanelNav>
                                                                {
                                                                    this.props.chapters &&
                                                                    this.getChapterNames()[0] &&
                                                                    this.getChapterNames()[0].name
                                                                }
                                                            </MadPanelNav>
                                                            <MadPanelContents style={{padding: '6px 0', textAlign: 'left'}}>
                                                                {
                                                                    this.props.chapters &&
                                                                    this.getChapterNames().map(t => <div key={`tp-${t.id}`} style={{margin: 2}}>{t.name}</div>)
                                                                }
                                                            </MadPanelContents>
                                                        </MadPanel>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    }
                                    <div className="row">
                                        <div className="column is-12">
                                            <div className="column is-flex is-hcentered">
                                                <MadButton text="닫기" onClick={() => this.closeModal('homeworkDetail')}/>
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
                                    <ManageStudentList
                                        students={this.state.courseStudents}
                                        title={'참여학생 변경'}
                                        filter={this.courseFilter}
                                        onActionButtonClick={this.modifyStudent}
                                        emptyListText="해당하는 학생이 없습니다"
                                        loadingInProgress={this.state.progress['modifyStudent']}
                                    />
                                </div>
                                <div className="column is-12 is-flex">
                                    <div className="column is-flex is-hcentered">
                                        <MadButton text="닫기" size={'normal'} onClick={() => this.closeModal('modifyStudent')}/>
                                    </div>
                                </div>
                            </MadModal>
                        }
                        {
                            this.state.modal['createHomework'] &&
                            <HomeworkCreateModal
                                course={this.props.course}
                                textbookDetail={this.props.textbookDetail}
                                textbookDetailByChapterName={this.props.textbookDetailByChapterName}
                                fetchCandidates={this.props.fetchCandidates}
                                createHomeworkLearnings={this.props.createHomeworkLearnings}
                                createHomework={this.createHomework}
                                progress={this.state.progress}
                                activateProgress={this.activateProgress}
                                deactivateProgress={this.deactivateProgress}
                                fetchTopChapters={this.props.fetchTopChapters}
                                chapters={this.props.chapters}
                                modal={this.state.modal}
                                openModal={this.openModal}
                                closeModal={this.closeModal}
                                openPrint={this.openPrint}
                            />
                        }
                    </div>
                </div>
            </DocumentTitle>);
    }
};

class HomeworkListItem extends PureComponent {
    render() {
        const {
            homework,
            openModalWrapper,
            openPrint,
            deleteHomework
        } = this.props;
        let createdText = '';
        if (homework.createdDate) {
            let termText = new Date(homework.createdDate).termText();
            if (termText[2] <= 2) createdText = `${termText[0]}${termText[1]}`
        }

        return <div key={homework.id} className="row homework-list-item is-gapless is-vcentered bottom-line-light simple-list-item">
            <div className="column is-2 small-padding-cell">
                <MadLocalDateFormat range={true} startLocalDate={homework.startDate} endLocalDate={homework.endDate}/>
            </div>
            <div className="column is-5 padding-cell">
                {
                    createdText &&
                    <span style={{color: '#ff6633', fontSize: '0.7em', display: 'block'}}>{createdText}&nbsp;출제</span>
                }
                {homework.title}
            </div>
            <div className="column is-2 padding-cell">
                {
                    homework.students.length === 0 && <span className="font-color-text-light">학생이 없습니다</span>
                }
                {
                    homework.students.length === 1 && `${homework.students[0].nickname}`
                }
                {
                    homework.students.length > 1 && `${homework.students[0].nickname}외 ${homework.students.length - 1}명`
                }
            </div>
            <div className="column is-3 is-flex is-vcentered padding-cell" style={{justifyContent: 'space-around'}}>
                <MadButton text="채점" sm ghost onClick={openModalWrapper('homework', homework)}/>
                <MadButton text="출력" sm ghost onClick={openPrint(homework)}/>
                <MadDropdown alignRight>
                    <MadButton icon="dots-vertical" sm ghost2 square style={{color: '#757575'}}/>
                    <li onClick={openModalWrapper('homeworkDetail', homework)}>구성</li>
                    <li onClick={deleteHomework(homework)} className="danger">삭제</li>
                </MadDropdown>
            </div>
        </div>
    }
}
