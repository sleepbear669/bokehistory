import React, {PureComponent} from 'react';
import ReactGA from 'react-ga';
import DocumentTitle from 'react-document-title';
import './CourseStudent.scss';
import {
    MadSubTitle,
    MadButton,
    Gap,
    MadPieChart,
    MadLoadingView
} from 'madComponents'
import StudentListModal from '../../components/StudentListModal';
import {GradeType} from "../.././../shared/gradeType";

export default class CourseStudent extends PureComponent {

    constructor(props) {
        super(props);

        this.state = {
            studentModal: false,
            courseNotFound: false,
            selectedGradeFilter: null,
            studentSearchQuery: '',
            progress: {},
        };
    }

    componentDidMount() {
        this.fetchCourse();
    }

    fetchCourse(studentId) {
        this.props.fetchCourse(this.props.match.params.id).then(r => {
            studentId && this.deactivateProgress(`modifyStudent-id${studentId}`);
            this.props.history.location.pathname.endsWith('/add') && this.openModal('studentModal')();
        }).catch(e => {
            this.setState({
                courseNotFound: true
            });
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
        ReactGA.modalview(modalName);
    };

    addStudent = student => () => {
        this.activateProgress(`modifyStudent-id${student.id}`);
        this.props.addStudent(this.props.course.id, student.id).then(result => {
            if (result) {
                this.fetchCourse(student.id);
            } else {
                alert("추가하지 못했습니다");
            }
        });
    };

    courseFilter = student => !this.props.course.students.find(ss => ss.id === student.id);

    removeStudent = student => e => {
        e.preventDefault();
        e.stopPropagation();
        this.activateProgress(`modifyStudent-id${student.id}`);
        if (confirm('수업에서 학생을 삭제합니다'))
            this.props.removeStudent(this.props.course.id, student.id).then(r => {
                this.fetchCourse(student.id);
            });
    };

    getPercent = student => {
        if (this.props.studentSummaries) {
            let summary = this.props.studentSummaries.find(s => s.studentId === student.id);
            if (summary) return summary.percent;
        }
        return 0;
    };

    openAnswerPage = student => e => {
        this.props.history.push(`/teacher/courses/${this.props.course.id}/students/${student.id}/textbook`);
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

    render() {
        let students = [{
            id: 0,
            text: '학생추가',
            type: 'btn'
        }];
        if (this.props.course && this.props.course.students)
            students = [...students, ...this.props.course.students];

        return (
            <DocumentTitle title='수업 - 학생목록'>
                <div>
                    {
                        this.state.courseNotFound &&
                        <div>해당 수업이 없습니다</div>
                    }
                    {
                        !this.state.courseNotFound &&
                        this.props.course === null &&
                        <MadLoadingView showText={true}/>
                    }
                    {
                        this.props.course &&
                        <div style={{marginTop: -8}}>
                            {
                                this.props.course.students.length === 0 &&
                                <div className="center">
                                    <p>이 수업에 참여하는 학생이 없습니다</p>
                                    <p>학생을 추가하세요</p>
                                </div>
                            }
                            {
                                <div>
                                    {
                                        students.map(student => {
                                            if (student.type === 'btn')
                                                return (
                                                    <div className="column flex-1 card is-flex is-vcentered"
                                                         style={{height: 96, padding: 8, breakInside: 'avoid', justifyContent: 'center', cursor: 'pointer', border: '1px solid rgba(34, 138, 230, 0.5)', color: '#228AE6', fontSize: 14, float: 'left', width: '275px', margin: '10px'}}
                                                         key={`s-${student.id}`}
                                                         onClick={this.openModal('studentModal')}>
                                                        <span>학생추가</span>
                                                    </div>
                                                );
                                            else
                                                return <div className="column flex-1 card is-flex is-vcentered" style={{height: 96, padding: 8, breakInside: 'avoid', cursor: 'pointer', float: 'left', width: '275px', margin: '10px'}} key={`s-${student.id}`}
                                                            onClick={this.openAnswerPage(student)}>
                                                    <MadPieChart value={this.getPercent(student)} style={{marginRight: 16}}/>
                                                    <div className="flex-2" style={{
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        maxWidth: '50%'
                                                    }}>
                                                        <MadSubTitle text={student.nickname} style={{
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                        }}/>
                                                        <Gap xs/>
                                                        <span className="font-color-text-light">{GradeType[student.grade]}</span>
                                                    </div>
                                                    <div className="is-flex flex-1 is-flex-pull-right hide-when-w-850">
                                                        <MadButton text="삭제" xs ghost isLoading={this.state.progress[`modifyStudent-id${student.id}`]} onClick={this.removeStudent(student)}/>
                                                    </div>
                                                </div>
                                        })
                                    }
                                </div>
                            }

                            <StudentListModal
                                isOpen={this.state.studentModal}
                                students={this.props.students}
                                title="학생추가"
                                filter={this.courseFilter}
                                onActionButtonClick={this.addStudent}
                                onRequestClose={this.closeModal('studentModal')}
                                emptyListText="해당하는 학생이 없습니다"
                                progress={this.state.progress}
                            />
                        </div>
                    }
                </div>
            </DocumentTitle>);
    }
};
