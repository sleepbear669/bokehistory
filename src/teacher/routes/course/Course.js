import React, {PureComponent} from 'react';
import {Link} from 'react-router-dom';
import ReactGA from 'react-ga';
import DocumentTitle from 'react-document-title';
import './Course.scss';
import {
    MadModal,
    MadSubTitle,
    MadButton,
    Gap,
    MadLoadingView,
    MadLinearLayout,
    MadLabeled,
    MadInput,
} from 'madComponents'

export default class Course extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            courseNotFound: false,
            selectedGradeFilter: null,
            studentSearchQuery: '',
            renameCourseModal: false,
            renameCourseInProgress: false,
            newTitle: '',
            isValidTitle: false,
            course: null,
        };
    }

    componentDidMount() {
        this.fetchCourse();
    }

    fetchCourse() {
        this.props.fetchCourse(this.props.match.params.id)
            .then(course => {
                this.setState({
                    course: course,
                });
                this.fetchTextbookDetail(course.textbook.id);
            })
            .catch(e => {
                this.setState({
                    courseNotFound: true
                });
            });
        this.props.fetchStudentSummary(this.props.match.params.id);
    }

    fetchTextbookDetail(textbookId) {
        this.props.fetchTextbookDetail(textbookId).catch(e => {
            alert('교재정보 로딩에 실패했습니다.');
        });
    }

    closeModal = modalName => () => {
        this.setState({
            [modalName]: false
        });
    };

    openModal = modalName => () => {
        this.setState({
            [modalName]: true
        });

        if (modalName === 'renameCourseModal') {
            this.setState({
                newTitle: this.state.course.title,
            });
        }

        ReactGA.modalview(modalName);
    };

    isActive = path => {
        return !!path.exec(this.props.location.pathname);
    };

    renameCourse = () => {
        this.setState({renameCourseInProgress: true});
        this.props.renameCourse(this.props.course.id, this.state.newTitle).then(r => {
            this.setState({
                renameCourseInProgress: false,
                renameCourseModal: false,
            });
        });
    };

    openQrCodeBook = e => {
        let popup = window.open(`/print/qrcodebook/${this.props.course.id}`, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
    };

    render() {
        return (
            <DocumentTitle title='수업'>
                <div>
                    {
                        this.state.courseNotFound &&
                        <div>해당 수업이 없습니다</div>
                    }
                    {
                        !this.state.courseNotFound &&
                        this.props.course === null &&
                        <MadLoadingView showText={false}/>
                    }
                    {
                        this.props.course &&
                        <div>
                            <div>
                                <Link to={`/teacher/courses`}>
                                    <MadButton ghost2 icon="arrow-left" square sm/>
                                </Link>
                                <MadSubTitle text={this.props.course.title} style={{display: 'inline-block'}}/>
                                <MadButton icon="pencil" xs ghost2 onClick={this.openModal('renameCourseModal')} square iconSize={16}/>
                                <Gap xs h/>
                                <span>{this.props.course.textbook.title}</span>
                                <Gap xs h/>
                                {
                                    this.props.course.students.length !== 0 &&
                                    <MadButton text="QR코드북 만들기" xs ghost onClick={this.openQrCodeBook}/>
                                }
                            </div>
                            <div style={{margin: '24px 0 24px'}}>
                                {
                                    this.props.course.students.length > 0 &&
                                    <React.Fragment>
                                        <Link to={`/teacher/courses/${this.props.course.id}/students/${this.props.course.students[0].id}/textbook`}>
                                            <MadButton text="교재 학습" sm ghost2 active={this.isActive(/\/students\/\d+\/textbook/)}/>
                                        </Link>
                                        <Link to={`/teacher/courses/${this.props.course.id}/students/${this.props.course.students[0].id}/recommend`}>
                                            <MadButton text="오답 클리닉" sm ghost2 active={this.isActive(/\/students\/\d+\/recommend/)}/>
                                        </Link>
                                        <Link to={`/teacher/courses/${this.props.course.id}/homeworkList`}>
                                            <MadButton text="과제 학습" sm ghost2 active={this.isActive(/\/courses\/\d+\/homeworkList/)}/>
                                        </Link>
                                        <Link to={`/teacher/courses/${this.props.course.id}/remindnoteList`}>
                                            <MadButton text="오답 노트" sm ghost2 active={this.isActive(/\/courses\/\d+\/remindnoteList/)}/>
                                        </Link>
                                        <Link to={`/teacher/courses/${this.props.course.id}/reportList`}>
                                            <MadButton text="보고서" sm ghost2 active={this.isActive(/\/courses\/\d+\/reportList/)}/>
                                        </Link>
                                    </React.Fragment>
                                }
                                <Gap xs h/>
                                <Link to={`/teacher/courses/${this.props.course.id}/students`} key="student-list">
                                    <MadButton text="학생 목록" sm ghost2 active={this.isActive(/\/students\/?$/) || this.isActive(/\/students\/add$/)}/>
                                </Link>
                            </div>
                        </div>
                    }

                    {
                        this.state.renameCourseModal &&
                        <MadModal
                            isOpen={this.state.renameCourseModal}
                            size={'sm'}
                            onRequestClose={this.closeModal('renameCourseModal')}
                            closeButton={true}>
                            <MadSubTitle key="studentModal-title">수업 이름 변경</MadSubTitle>
                            <Gap/>
                            <MadLinearLayout>
                                <Gap xs/>
                                <MadLabeled label={'수업 이름'} labelAlign={'left'} labelWidth={'30%'}>
                                    <MadInput text={this.state.newTitle} width={'100%'} onChange={e => this.setState({
                                        newTitle: e.target.value,
                                        isValidTitle: e.target.value.length > 2
                                    })}/>
                                </MadLabeled>
                                <div className="column is-flex is-hcentered">
                                    <MadButton text="변경" onClick={() => this.renameCourse()} isLoading={this.state.renameCourseInProgress} disabled={this.state.renameCourseInProgress || !this.state.isValidTitle}/>
                                </div>
                            </MadLinearLayout>
                        </MadModal>
                    }
                </div>
            </DocumentTitle>);
    }
};
