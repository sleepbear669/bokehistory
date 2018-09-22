import React, {PureComponent} from 'react';
import DocumentTitle from 'react-document-title';
import './RemindnoteList.scss';
import {
    Gap,
    MadButton,
    MadTab,
    MadTabNav,
    MadTabNavItem,
    MadTabContents,
    MadCheckbox,
    MadLoadingView
} from 'madComponents';
import StudentList from "../../components/StudentList";

export default class RemindnoteList extends PureComponent {

    state = {
        selectedLearnings: {},
    };

    componentDidMount() {
        const courseId = this.props.match.params.id;
        this.props.fetchCourse(courseId).then(course => {
            this.setState({
                courseId,
                student: course.students[0]
            });
            this.props.fetchTextbookLearnings(courseId, course.students[0].id);
            this.props.fetchRecommendLearnings(courseId, course.students[0].id);
        });
    }

    isSelectedLearning = learning => {
        return this.state.selectedLearnings[learning.id];
    };

    toggleSelect = learning => () => {
        const isSelected = this.state.selectedLearnings[learning.id];
        this.setState({
            ...this.state,
            selectedLearnings: {
                ...this.state.selectedLearnings,
                [learning.id]: !isSelected
            }
        });
    };

    clearSelections = () => {
        this.setState({
            ...this.state,
            selectedLearnings: {}
        });
    };

    createRemindNoteByMadLearning = () => {
        let learningIds = Object.keys(this.state.selectedLearnings);
        this.props.createRemindNoteByMadLearning(this.props.match.params.id, learningIds, this.state.student.id).then(r => {
            let url = `/print/remindnote/${r.id}/`;
            let popup = window.open(url, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                alert('출력 화면이 나타나지 않을 경우 브라우저에서 팝업 차단을 해제해주세요');
                this.setState({isPopupBlocked: true, blockedPopUpUrl: url});
            }
        });
    };

    createRemindNoteByTextbook = () => {
        let learningIds = Object.keys(this.state.selectedLearnings).map(i => parseInt(i));
        let selectedLearnings = this.props.textbookLearnings.filter(l => learningIds.includes(l.id));
        let pageIds = selectedLearnings.map(l => l.textbookPage.id);
        this.props.createRemindNoteByTextbook(this.props.match.params.id, pageIds, this.state.student.id);
    };

    canCreateRemindnote = () => {
        return Object.values(this.state.selectedLearnings).some(i => i);
    };

    openPopUpUrl = () => {
        this.setState({isPopupBlocked: false});
        window.open(this.state.blockedPopUpUrl, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
    };

    onSelectStudent = student => {
        this.props.fetchTextbookLearnings(this.state.courseId, student.id);
        this.props.fetchRecommendLearnings(this.state.courseId, student.id);
        this.setState({student});
    };

    render() {
        return (
            <DocumentTitle title='오답 노트'>
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
                        <div className="row">
                            {
                                this.props.course &&
                                <StudentList className="column is-4"
                                             students={this.props.course.students}
                                             currentStudent={this.state.student}
                                             courseId={this.props.course.id}
                                             onSelectStudent={this.onSelectStudent}
                                             loadingInProgress={this.activateProgress}/>
                            }
                            <MadTab onClickTab={this.clearSelections}>
                                <MadTabNav>
                                    <MadTabNavItem>오답클리닉에서 오답노트 만들기</MadTabNavItem>
                                    <MadTabNavItem>교재학습에서 오답노트 만들기</MadTabNavItem>
                                </MadTabNav>
                                <MadTabContents className="mad-tab-integration">
                                    {
                                        this.props.recommendLearnings &&
                                        <div>
                                            {
                                                this.props.recommendLearnings.length === 0 && <span>틀린 문항이 없습니다</span>
                                            }
                                            <ul className="no-ul-style">
                                                {
                                                    this.props.recommendLearnings.map(l => {
                                                        return <li key={`l-${l.id}`}>
                                                            <MadCheckbox
                                                                text={`오답 클리닉 ${l.page}페이지 - 오답: ${l.wrongUnitCount}문제`}
                                                                onChange={this.toggleSelect(l)}
                                                                checked={this.isSelectedLearning(l)}
                                                                className="is-vcentered simple-list-item bottom-line-light"
                                                                style={{width: '100%'}}/>
                                                        </li>
                                                    })
                                                }
                                            </ul>
                                            <Gap sm/>
                                            <div style={{textAlign: 'right'}}>
                                                <MadButton text="선택한 학습으로 오답노트 출력하기" sm onClick={this.createRemindNoteByMadLearning} disabled={!this.canCreateRemindnote()}/>
                                            </div>
                                        </div>
                                    }
                                    {
                                        !this.props.recommendLearnings && <MadLoadingView/>
                                    }
                                </MadTabContents>
                                <MadTabContents className="mad-tab-integration">
                                    추후 지원 예정입니다
                                    {/*{*/}
                                    {/*this.props.textbookLearnings &&*/}
                                    {/*<div>*/}
                                    {/*{*/}
                                    {/*this.props.textbookLearnings.length === 0 && <span>틀린 문항이 없습니다</span>*/}
                                    {/*}*/}
                                    {/*<ul className="no-ul-style">*/}
                                    {/*{*/}
                                    {/*this.props.textbookLearnings.map(l => {*/}
                                    {/*return <li key={`l-${l.id}`}>*/}
                                    {/*<MadCheckbox*/}
                                    {/*text={`${l.textbookPage.pageNumber} 페이지 - 오답: ${l.wrongUnitCount}문제`}*/}
                                    {/*onChange={this.toggleSelect(l)}*/}
                                    {/*checked={this.isSelectedLearning(l)}*/}
                                    {/*className="is-vcentered simple-list-item bottom-line-light"/>*/}
                                    {/*</li>*/}
                                    {/*})*/}
                                    {/*}*/}
                                    {/*</ul>*/}
                                    {/*<Gap sm/>*/}
                                    {/*<div style={{textAlign: 'right'}}>*/}
                                    {/*<MadButton text="선택한 학습으로 오답노트 출력하기" size="sm" onClick={this.createRemindNoteByTextbook} disabled={!this.canCreateRemindnote()}/>*/}
                                    {/*</div>*/}
                                    {/*</div>*/}
                                    {/*}*/}
                                    {/*{*/}
                                    {/*!this.props.textbookLearnings && <MadLoadingView/>*/}
                                    {/*}*/}
                                </MadTabContents>
                            </MadTab>
                        </div>
                    </div>
                </div>
            </DocumentTitle>);
    }
}
