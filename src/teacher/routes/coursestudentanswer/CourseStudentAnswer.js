import React, {PureComponent} from 'react';
import ReactGA from 'react-ga';
import DocumentTitle from 'react-document-title';
import './CourseStudentAnswer.scss';

import {
    MadSubTitle,
    MadButton,
    MadModal,
    AnswerTable,
    TextbookAnswerTable,
    ErrorBoundary,
    MadButtonGroup,
    Gap,
} from "madComponents";
import {
    TextbookPageList
} from "jokerComponents";
import StudentList from "../../components/StudentList";
import RecommendLearningList from "../../components/RecommendLearningList";

const countOptions = [
    {label: '1', value: 1},
    {label: '2', value: 2},
    {label: '3', value: 3},
];

export default class CourseStudentAnswer extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            student: null,
            currentPage: null,
            answerStatus: {},
            currentLearning: null,
            selectedPages: [],
            answerModalIsOpen: false,
            isPopupBlocked: false,
            progress: {},
            customRecommendModalIsOpen: false,
            currentSelectedCount: countOptions[0]
        }
    }

    componentDidMount() {
        this.props.fetchCourse(this.props.match.params.id).then(course => {
            this.props.fetchTextbook(course.textbook.id);

            if (this.props.match.params.learningType === 'textbook') {
                this.props.fetchLearnings(course.id, this.props.match.params.studentId);
            } else if (this.props.match.params.learningType === 'recommend') {
                this.props.fetchRecommendLearnings(course.id, this.props.match.params.studentId);
            }

            this.setState({
                student: course.students.find(s => s.id === parseInt(this.props.match.params.studentId))
            });
        });
    }

    componentWillReceiveProps(nextProps) {
        let studentId = parseInt(nextProps.match.params.studentId);
        if (this.props.match.params.studentId !== nextProps.match.params.studentId
            || nextProps.match.params.learningType !== this.props.match.params.learningType) {

            this.setState({
                student: nextProps.course.students.find(s => s.id === studentId),
                selectedPages: []
            });

            if (nextProps.match.params.learningType === 'textbook') {
                this.props.fetchLearnings(this.props.course.id, studentId).then(r => {
                    this.deactivateProgress('learningPageLoading');
                    if (this.state.currentPage)
                        this.onClickPage(this.state.currentPage, studentId, true);
                });
                this.setState({currentLearning: null});
            } else if (nextProps.match.params.learningType === 'recommend') {
                this.props.fetchRecommendLearnings(this.props.course.id, studentId).then(r => {
                });
                this.setState({currentLearning: null});
            }
        } else {
            this.deactivateProgress('learningPageLoading');
        }
    }

    onClickPage = (page, studentId, forceUpdate) => {
        // if (!forceUpdate && this.state.currentPage === page) return;

        studentId = studentId ? studentId : parseInt(this.props.match.params.studentId);
        this.activateProgress('loadLearningInProgress');
        this.setState({
            currentPage: page,
        });
        if (!forceUpdate) this.openAnswerModal();

        let learning = this.props.learnings.find(l => l.student.id === studentId && l.textbookPage.id === page.id);

        if (learning) {
            this.deactivateProgress('loadLearningInProgress');
            this.setState({
                currentLearning: learning,
            });
        } else
            this.props.createTextbookLearning(this.props.match.params.id, page.id, studentId).then(createLearningResult => {
                if (createLearningResult.success) {
                    this.deactivateProgress('loadLearningInProgress');
                    this.setState({
                        currentLearning: createLearningResult.learning,
                    });
                } else {
                    alert("학습을 만들지 못했습니다");
                    this.closeAnswerModal();
                    this.deactivateProgress('loadLearningInProgress');
                }
            })
    };

    onClickRecommendLearning = learning => {
        this.activateProgress('loadLearningInProgress');
        this.props.fetchLearning(learning.id).then(r => {
            this.deactivateProgress('loadLearningInProgress');
            this.setState({
                currentLearning: r,
            });
            this.openAnswerModal();
        });

    };


    submitAnswer = (learningId, userAnswers) => {
        this.activateProgress('submitInProgress');
        this.setState({
            currentLearning: {
                ...this.state.currentLearning,
                userAnswers
            }
        });
        this.props.submitAnswer(learningId, userAnswers).then(r => {
            if (r) {
                this.props.fetchLearning(learningId).then(learning => {
                    let selectedPages = this.state.selectedPages;

                    if (this.props.match.params.learningType === 'textbook')
                        selectedPages = [...selectedPages, this.state.currentPage];

                    this.deactivateProgress('submitInProgress');
                    this.setState({
                        currentLearning: learning,
                        selectedPages,
                        answerModalIsOpen: false,
                    });
                });
                this.props.fetchStudentSummary(this.props.match.params.id, this.state.student.id);
            } else {
                alert("답안 제출에 실패했습니다");
                this.deactivateProgress('submitInProgress');
            }
        });
    };

    resetLearning = (learningId) => {
        const {selectedPages, currentLearning} = this.state;
        this.activateProgress('resetLearningInProgress');
        this.props.resetLearning(currentLearning.id)
            .then(r => {
                if (r.success) {
                    this.props.fetchLearning(learningId).then(learning => {
                        this.setState({
                            currentLearning: learning,
                            selectedPages: selectedPages.filter(sp => sp.id !== currentLearning.textbookPage.id)
                        });
                    });
                } else {
                    alert("초기화에 실패했습니다");
                }
                this.props.fetchStudentSummary(this.props.match.params.id, this.state.student.id);
                this.deactivateProgress('resetLearningInProgress');
            })
            .catch(e => {
                alert("초기화에 실패했습니다.");
                this.deactivateProgress('resetLearningInProgress');
            });
    };

    createRecommendLearning = () => {
        let selectedLearnings = this.props.learnings.filter(learning => {
            return this.state.selectedPages.find(p => p.id === learning.textbookPage.id);
        });
        if (selectedLearnings.length === 0) return;

        this.setState({createRecommendInProgress: true});
        this.props.checkDuplications(selectedLearnings.map(l => l.textbookPage.id), selectedLearnings[0].student.id).then(idDuplicated => {
            if (idDuplicated && !confirm("선택된 페이지에 대한 오답클리닉이 존재합니다. 그래도 만드시겠습니까?")) {
                this.setState({createRecommendInProgress: false});
                return;
            }

            let option = {
                learningIds: selectedLearnings.map(l => l.id),
                countLimitOfEachUnitGroup: this.state.currentSelectedCount.value,
                totalCount: 50
            };
            this.props.createRecommendLearning(option).then(r => {
                this.setState({
                    createRecommendInProgress: false,
                    selectedPages: []
                });
                this.closeCustomRecommendModal();
                this.openPrint(r.learning)();
            }).catch(e => {
                console.log(e);
                alert("만들 수 없습니다: " + e.response.data.message);
                this.setState({createRecommendInProgress: false});
            });
        });
    };

    openPrint = learning => () => {
        this.setState({isPopupBlocked: false});
        let url = `/print/recommend/${learning.id}/`;
        let popup = window.open(url, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
        if (!popup || popup.closed || typeof popup.closed === 'undefined') this.setState({isPopupBlocked: true, blockedPopUpUrl: url});
    };

    onSelectPage = page => e => {
        if (e.target.checked)
            this.setState({
                selectedPages: [...this.state.selectedPages, page]
            });
        else
            this.setState({
                selectedPages: this.state.selectedPages.filter(p => p !== page)
            });
    };

    numberOfWrongUnits() {
        if (this.props.match.params.learningType === 'textbook') {
            let learnings = this.props.learnings.filter(learning => {
                return this.state.selectedPages.find(p => p.id === learning.textbookPage.id);
            });

            return learnings.map(learning => {
                if (learning.userAnswers)
                    return learning.userAnswers.filter(a => a.correct === false).length;
                return 0;
            }).reduce((a, b) => a + b, 0);
        }
    }

    closeAnswerModal = () => {
        this.setState({answerModalIsOpen: false});
    };

    openAnswerModal = () => {
        this.setState({answerModalIsOpen: true});
        ReactGA.modalview('openAnswerModal');
    };

    openCustomRecommendModal = () => {
        this.fetchCandidatesCount(this.state.currentSelectedCount);
        this.setState({customRecommendModalIsOpen: true});
        ReactGA.modalview('openCustomRecommendModal');
    };

    closeCustomRecommendModal = () => {
        this.setState({customRecommendModalIsOpen: false});
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

    onSelectCount = option => {
        this.setState({currentSelectedCount: option});
        this.fetchCandidatesCount(option);
    };

    fetchCandidatesCount(option) {
        let learningIds = this.props.learnings.filter(learning => {
            return this.state.selectedPages.find(p => p.id === learning.textbookPage.id);
        }).map(l => l.id);

        this.props.candidates({
            learningIds,
            countLimitOfEachUnitGroup: option.value,
            totalCount: 50
        });
    }

    openPopUpUrl = () => {
        this.setState({isPopupBlocked: false});
        window.open(this.state.blockedPopUpUrl, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
    };

    render() {
        return (
            <DocumentTitle title='수업 - 학습'>
                <ErrorBoundary>
                    <div className="row">
                        <div className="column is-12 card">
                            {
                                this.state.isPopupBlocked &&
                                <p style={{
                                    color: 'white',
                                    background: '#ff6f00',
                                    padding: '6px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    marginTop: 0,
                                    cursor: 'pointer'
                                }} onClick={this.openPopUpUrl}>출력 화면이 나타나지 않을 경우 브라우저에서 팝업 차단을 해제해주세요</p>
                            }

                            <div className="row" style={{height: 48}}>
                                <div className="column is-12">
                                    <div className="row is-gapless is-vcentered">
                                        <div className="column is-6">
                                            {
                                                this.state.student &&
                                                <MadSubTitle text={`${this.state.student.nickname} 학생 채점`}/>
                                            }
                                        </div>
                                        <div className="column is-6">
                                            {
                                                this.numberOfWrongUnits() > 0 &&
                                                <MadButton text="오답 클리닉 만들기"
                                                           xs ghost
                                                           onClick={this.openCustomRecommendModal}
                                                           className="pull-right"/>
                                            }
                                            {
                                                this.numberOfWrongUnits() > 0 &&
                                                <MadSubTitle text={`오답 클리닉 문제: ${this.numberOfWrongUnits()}개`} className="pull-right" style={{marginRight: 16}}/>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row" style={{
                                height: `calc(100vh - 256px)`,
                                overflow: 'hidden',
                            }}>
                                {
                                    this.props.course &&
                                    <StudentList className="column is-4"
                                                 students={this.props.course.students}
                                                 currentStudent={this.state.student}
                                                 courseId={this.props.course.id}
                                                 learningType={this.props.match.params.learningType}
                                                 summariesByStudentId={this.props.summariesByStudentId}
                                                 loadingInProgress={this.activateProgress}/>
                                }
                                {
                                    this.props.match.params.learningType === 'textbook' &&
                                    <TextbookPageList className="column is-8"
                                                      textbook={this.props.textbook}
                                                      learnings={this.props.learnings}
                                                      onClickPage={this.onClickPage}
                                                      onSelectPage={this.onSelectPage}
                                                      selectedPages={this.state.selectedPages}
                                                      currentPage={this.state.currentPage}
                                                      openPrint={this.openPrint}
                                                      loadingInProgress={this.state.progress['learningPageLoading']}/>
                                }
                                {
                                    this.props.match.params.learningType === 'recommend' &&
                                    <RecommendLearningList className="column is-8"
                                                           learnings={this.props.recommendLearnings}
                                                           currentLearning={this.state.currentLearning}
                                                           onClickLearning={this.onClickRecommendLearning}
                                                           openPrint={this.openPrint}/>
                                }
                                <MadModal
                                    isOpen={this.state.answerModalIsOpen}
                                    onRequestClose={this.closeAnswerModal}
                                    size={'lg'}
                                    closeButton={true}
                                    shouldCloseOnOverlayClick={false}>
                                    {
                                        this.props.match.params.learningType === 'recommend' &&
                                        <AnswerTable
                                            learning={this.state.currentLearning}
                                            submitAnswer={this.submitAnswer}
                                            loadingInProgress={this.state.progress['loadLearningInProgress']}
                                            submitInProgress={this.state.progress['submitInProgress']}
                                            resetLearning={this.resetLearning}
                                            resetLearningInProgress={this.state.progress['resetLearningInProgress']}/>
                                    }
                                    {
                                        this.props.match.params.learningType === 'textbook' &&
                                        <TextbookAnswerTable
                                            learning={this.state.currentLearning}
                                            submitAnswer={this.submitAnswer}
                                            loadingInProgress={this.state.progress['loadLearningInProgress']}
                                            submitInProgress={this.state.progress['submitInProgress']}
                                            resetLearning={this.resetLearning}
                                            resetLearningInProgress={this.state.progress['resetLearningInProgress']}/>
                                    }
                                </MadModal>

                                <MadModal
                                    isOpen={this.state.customRecommendModalIsOpen}
                                    onRequestClose={this.closeCustomRecommendModal}
                                    closeButton={true}
                                    shouldCloseOnOverlayClick={true}>
                                    <MadSubTitle text={`오답 클리닉 문제: ${this.numberOfWrongUnits()}개`}/>
                                    <Gap/>
                                    <div style={{
                                        display: 'inline-flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: '100%',
                                        fontSize: 15,
                                    }}>
                                        유형당&nbsp;
                                        <MadButtonGroup
                                            value={this.state.currentSelectedCount}
                                            options={countOptions}
                                            clearable={false}
                                            multiSelect={false}
                                            size="sm"
                                            flex
                                            onChange={this.onSelectCount}
                                        />&nbsp;
                                        문제
                                    </div>
                                    <Gap sm/>
                                    <div style={{
                                        textAlign: 'center'
                                    }}>
                                        <span style={{
                                        color: '#228ae6',
                                        fontSize: 20
                                    }}>{this.props.candidatesResult}</span> 문제가 출제됩니다
                                        <Gap sm/>
                                        <MadButton text="오답 클리닉 만들기"
                                                   onClick={this.createRecommendLearning}
                                                   isLoading={this.state.createRecommendInProgress}
                                        />
                                    </div>

                                </MadModal>
                            </div>
                        </div>
                    </div>
                </ErrorBoundary>
            </DocumentTitle>
        );
    }
};
