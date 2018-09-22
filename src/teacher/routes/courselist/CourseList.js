import React, {PureComponent} from 'react';
import ReactGA from 'react-ga';
import DocumentTitle from 'react-document-title';
import './CourseList.scss';
import {CourseOption} from "shared/courseOption";

import {
    MadSubTitle,
    MadButton,
    MadModal,
    Gap,
    MadInput,
    MadLabeled,
    MadLinearLayout,
    MadLoadingView,
    MadSelect,
} from 'madComponents';

import CourseListItem from "../../components/CourseListItem/CourseListItem";
import {Grade} from "../.././../shared/gradeType";

export default class CourseList extends PureComponent {

    state = {
        createCourseModal: false,
        title: "",
        selectedCourse: null,
        selectedTextbook: null,
        selectedStudents: [],
        createCourseInProgress: false,
        selectedGradeFilter: null,
        selectedTextbookFilter: null,
        courseSearchQuery: "",
    };

    componentDidMount() {
        this.props.fetchCourses().then(courses => {
            courses.forEach(course => {
                this.props.fetchCourseSummary(course.id);
            });
        });
    }

    openCreateCourseModal() {
        this.setState({createCourseModal: true});
        this.props.fetchCompleteTextbooks();
        ReactGA.modalview('openCreateCourseModal');
    }

    closeCreateCourseModal() {
        this.setState({createCourseModal: false, bookGradeCourseOption: null, title: ""});
    }

    onSelectTextbook = selected => {
        this.setState({
            selectedTextbook: selected,
            title: `[${selected.title}]`,
            isValidTitle: true
        });
    };

    createCourse() {
        if (this.state.createCourseInProgress) return;
        this.setState({
            createCourseInProgress: true
        });

        this.props.createCourse(
            this.state.title,
            this.state.selectedTextbook.id,
            this.state.selectedStudents.map(s => s.id)
        ).then(r => {
            this.closeCreateCourseModal();
            this.setState({
                createCourseModal: false,
                title: "",
                selectedTextbook: null,
                selectedStudents: [],
                createCourseInProgress: false,
            });
            this.props.fetchCourses();
        });
    }

    deleteCourse = course => e => {
        if (confirm(`"${course.title}" 수업을 삭제합니다`)) {
            this.props.deleteCourse(course.id).then(r => {
                if (r) {
                    this.props.fetchCourses();
                    this.setState({
                        recentlyDeletedCourse: course,
                    });
                    alert(`"${course.title}" 수업이 삭제되었습니다`);
                } else alert(`"${course.title}" 수업 삭제에 실패했습니다`);
            }).catch(e => {
                console.log(e);
                alert(`"${course.title}" 수업 삭제에 실패했습니다`);
            });
        }
        e.preventDefault();
        e.stopPropagation();
    };

    openCourseDetail = course => e => {
        if (course.students == null || course.students.length == 0)
            this.props.history.push(`/teacher/courses/${course.id}/students/`);
        else
            this.props.history.push(`/teacher/courses/${course.id}/students/${course.students[0].id}/textbook`);
        e.preventDefault();
        e.stopPropagation();
    };

    rollbackCourse = course => e => {
        if (confirm(`"${course.title}" 수업을 복원합니다`)) {
            this.props.rollbackDeleteCourse(course.id).then(r => {
                if (r) {
                    this.props.fetchCourses();
                    this.setState({
                        recentlyDeletedCourse: null
                    });
                } else alert("복원에 실패했습니다");
            }).catch(e => {
                console.log(e);
                alert("복원에 실패했습니다");
            });
        }
        e.preventDefault();
        e.stopPropagation();
    };

    openAnswerView = course => e => {
        this.props.history.push(`/teacher/courses/${course.id}/students/${course.students[0].id}/textbook`);
        e.preventDefault();
        e.stopPropagation();
    };

    getPercent = course => {
        if (this.props.courseSummaries) {
            let summary = this.props.courseSummaries[course.id];
            if (summary) return summary.percent;
        }
        return 0;
    };

    onSelectGradeFilter = value => {
        this.setState({
            selectedGradeFilter: value
        })
    };

    onSelectTextbookFilter = value => {
        this.setState({
            selectedTextbookFilter: value
        })
    };

    filterByGrade = course => {
        if (this.state.selectedGradeFilter) {
            return course.textbook.grade === this.state.selectedGradeFilter.value;
        }
        return true;
    };

    filterByTextbook = course => {
        if (this.state.selectedTextbookFilter) {
            return course.textbook.id === this.state.selectedTextbookFilter.value.id;
        }
        return true;
    };

    filterByQuery = course => {
        if (this.state.courseSearchQuery && this.state.courseSearchQuery.length >= 1) {
            const title = course.title;
            const textbookTitle = course.textbook.title;
            const grade = course.textbook.grade || '';
            const teacherName = course.teacher.nickname;

            let queryWords = this.state.courseSearchQuery.split(' ');
            return queryWords.find(w => {
                return title.includes(w) ||
                    textbookTitle.includes(w) ||
                    grade.includes(w) ||
                    teacherName.includes(w)
                    ;
            });
        }
        return true;
    };

    onSelectCourse = selectedOption => {
        this.setState({
            bookGradeCourseOption: selectedOption,
            selectedCourse: selectedOption,
            selectedTextbook: null,
            title: "",
        });
    };

    filterBookByCourse = textbook => {
        if (this.state.bookGradeCourseOption)
            return this.state.bookGradeCourseOption.value.includes(textbook.rootChapter.contentId);
        return true;
    };

    isDuplicatedCourseTitle = newCourseTitle => {
        if (this.props.courses)
            return this.props.courses.map(c => c.title).filter(t => t === newCourseTitle).length > 0;
        return false;
    };

    groupByTeacher = course => {
        return course.teacher.id;
    };

    render() {
        let {textbooks} = this.props;
        textbooks = (textbooks || []).filter(this.filterBookByCourse);

        return (
            <DocumentTitle title='수업 목록'>
                <div>
                    <div className="row">
                        <div className="column is-flex"><MadSubTitle text="수업 목록"/></div>
                        <div className="column is-flex is-flex-pull-right"><MadButton text="수업 만들기" onClick={() => this.openCreateCourseModal()} xs/></div>
                    </div>
                    <Gap sm/>
                    {
                        this.props.courses === null &&
                        <MadLoadingView showText={true}/>
                    }
                    {
                        this.props.courses && this.props.courses.length === 0 &&
                        <div className="row">
                            <div className="column is-12 center">
                                <p>진행중인 수업이 없습니다</p>
                                <p>수업을 만들어보세요</p>
                                <MadButton text="수업 만들기" onClick={() => this.openCreateCourseModal()} xs/>
                            </div>
                        </div>
                    }
                    {
                        this.props.courses && this.props.courses.length > 0 &&
                        <div className="card is-flex">
                            <MadSelect key="select-grade"
                                       className="flex-1"
                                       name="form-field-name"
                                       placeholder="학년"
                                       value={this.state.selectedGradeFilter}
                                       options={Grade}
                                       searchable={true}
                                       clearable={true}
                                       pageSize={2}
                                       onChange={this.onSelectGradeFilter}
                                       style={{width: '100%'}}
                            />
                            <Gap sm h/>
                            <MadSelect key="select-book"
                                       className="flex-1"
                                       name="form-field-name"
                                       placeholder="교재"
                                       value={this.state.selectedTextbookFilter}
                                       options={this.props.textbooksInCourses}
                                       searchable={true}
                                       clearable={true}
                                       pageSize={2}
                                       onChange={this.onSelectTextbookFilter}
                                       style={{width: '100%'}}
                            />
                            <Gap sm h/>
                            <MadInput icon="magnify" placeholder="검색" type="search"
                                      style={{flex: 2}}
                                      text={this.state.courseSearchQuery}
                                      onChange={e => this.setState({
                                          courseSearchQuery: e.target.value
                                      })}/>
                        </div>
                    }
                    {
                        this.props.courses &&
                        <div className="row">
                            <div className="column is-12">
                                {
                                    Object.entries(
                                        this.props.courses
                                            .filter(this.filterByGrade)
                                            .filter(this.filterByTextbook)
                                            .filter(this.filterByQuery)
                                            .groupBy(this.groupByTeacher))
                                        .flatMap(([teacherId, courses]) => {
                                            if (courses && courses.length > 0) return [
                                                <div key={teacherId} className="course-list-group-header">
                                                    <span>{`${courses[0].teacher.nickname}님의 수업 - ${courses.length}개`}</span>
                                                </div>,
                                                ...courses.sortBy('createdDate')
                                                    .reverse()
                                                    .map(course => {
                                                        return (<CourseListItem key={`c${course.id}`}
                                                                                course={course}
                                                                                percent={this.getPercent(course)}
                                                                                onClickCourse={this.openCourseDetail}
                                                                                onClickAnswer={this.openAnswerView}
                                                                                onClickDelete={this.deleteCourse}
                                                        />)
                                                    })
                                            ];
                                            return [];
                                        })
                                }
                                {
                                    this.state.recentlyDeletedCourse &&
                                    <div style={{opacity: 0.66, marginTop: 24}}>
                                        <div style={{display: 'flex', margin: '24px 0'}}>
                                            <div style={{
                                                flex: 1,
                                                borderTop: '1px solid gray',
                                                height: '0.5em',
                                                marginTop: '0.5em'
                                            }}/>
                                            <span style={{padding: '0 16px'}}>
                                            방금 삭제한 수업
                                        </span>
                                            <div style={{
                                                flex: 1,
                                                borderTop: '1px solid gray',
                                                height: '0.5em',
                                                marginTop: '0.5em'
                                            }}/>
                                        </div>
                                        <CourseListItem key={`c${this.state.recentlyDeletedCourse.id}`}
                                                        course={this.state.recentlyDeletedCourse}
                                                        percent={this.getPercent(this.state.recentlyDeletedCourse)}
                                                        onClickCta={this.rollbackCourse}
                                                        onClickMore={this.onClickMore}
                                                        ctaText="복원하기"
                                        />
                                    </div>
                                }
                            </div>
                        </div>
                    }
                    <MadModal
                        isOpen={this.state.createCourseModal}
                        size={'sm'}
                        onRequestClose={() => this.closeCreateCourseModal()}
                        closeButton={true}>
                        <MadSubTitle key="studentModal-title">수업 만들기</MadSubTitle>
                        <Gap/>
                        <MadLinearLayout>
                            <Gap xs/>
                            <MadLabeled label="과정" labelAlign="left" labelWidth={'30%'}>
                                <MadSelect
                                    className="flex-1"
                                    name="form-field-name"
                                    placeholder={'과정선택 / 검색'}
                                    value={this.state.selectedCourse}
                                    options={CourseOption}
                                    searchable={true}
                                    clearable={true}
                                    shouldCloseOnOverlayClick={false}
                                    pageSize={2}
                                    onChange={this.onSelectCourse}
                                    style={{width: '100%'}}
                                />
                            </MadLabeled>
                            <MadLabeled label="교재" labelAlign="left" labelWidth={'30%'}>
                                <MadSelect
                                    className="flex-1"
                                    name="form-field-name"
                                    placeholder={'교재선택 / 검색'}
                                    value={this.state.selectedTextbook}
                                    options={textbooks}
                                    searchable={true}
                                    clearable={false}
                                    shouldCloseOnOverlayClick={false}
                                    pageSize={2}
                                    onChange={this.onSelectTextbook}
                                    style={{width: '100%'}}
                                />
                            </MadLabeled>
                            <MadLabeled label={'수업 이름'} labelAlign={'left'} labelWidth={'30%'}>
                                <MadInput text={this.state.title} width={'100%'} onChange={e => this.setState({
                                    title: e.target.value,
                                    isValidTitle: e.target.value.length > 2
                                })} errorMessage={"이미 같은 이름의 수업이 존재합니다"} isErrorPredicate={this.isDuplicatedCourseTitle}/>
                            </MadLabeled>
                            <div className="column is-flex is-hcentered">
                                <MadButton text="수업 만들기" onClick={() => this.createCourse()} isLoading={this.state.createCourseInProgress} disabled={this.state.createCourseInProgress || !this.state.isValidTitle || !this.state.selectedTextbook}/>
                            </div>
                        </MadLinearLayout>
                    </MadModal>
                </div>
            </DocumentTitle>
        );
    }
};
