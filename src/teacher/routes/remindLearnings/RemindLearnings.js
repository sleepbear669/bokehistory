import React, {PureComponent} from 'react';
import moment from 'moment';
import classNames from 'classnames';
import DocumentTitle from 'react-document-title';
import './RemindLearnings.scss';
import {
    Gap,
    MadButton,
    MadButtonGroup,
    MadLabeled,
    MadModal,
    MadSubTitle,
    SimpleRowList,
    MadLocalDateFormat,
    MadCheckbox,
    MadDropdown,
    MadSelect,
} from "madComponents";
import {DateRangePicker} from 'react-dates';
import ManageStudentList from '../../components/ManageStudentsList';
import {Level} from '../../../shared/homeworkType';
import {Link} from "react-router-dom";

const LearningTypes = {
    options: [
        // {label: '교재학습', value: 'TEXTBOOK', icon: 'checkbox-blank-outline', activeIcon: 'checkbox-marked', iconSize: 15},
        {label: '오답클리닉', value: 'RECOMMEND', icon: 'checkbox-blank-outline', activeIcon: 'checkbox-marked', iconSize: 15},
        {label: '수업과제', value: 'HOMEWORK', icon: 'checkbox-blank-outline', activeIcon: 'checkbox-marked', iconSize: 15},
        {label: '문제은행', value: 'OPEN_HOMEWORK', icon: 'checkbox-blank-outline', activeIcon: 'checkbox-marked', iconSize: 15},
        // {label: '오답학습', value: 'REMIND', icon: 'checkbox-blank-outline', activeIcon: 'checkbox-marked', iconSize: 15},
    ]
};

const RemindLearningsDateWindowSize = 7;

export default class RemindLearnings extends PureComponent {
    state = {
        selectedCourse: null,
        course: null,
        step: 0,
        scope: {
            startDate: moment(new Date()).startOf('day').add(-RemindLearningsDateWindowSize, 'days'),
            endDate: moment(new Date()).endOf('day'),
        },
        createForm: {
            // options={LearningTypes.options}
            // options={Level}
            selectedStudents: [],
            startDate: moment(new Date()).startOf('day').add(-RemindLearningsDateWindowSize, 'days'),
            endDate: moment(new Date()).endOf('day'),
            selectedLearningTypes: [...LearningTypes.options],
            selectedLevels: [...Level],
        },
        modal: {},
        selectedLearningResults: {},
    };

    componentDidMount() {
        this.setState({
            days: Array(RemindLearningsDateWindowSize).fill(0).map((_, i) => moment().subtract(i, 'days')).reverse()
        });
        // fetch all remindLearnings in range
        this.props.fetchRemindLearnings();
        this.props.fetchCourses().then(courses => {
            let course = courses[0];
            let students = course.students;
            this.setState({students, course});
            this.fetchCandidateCount(students.map(student => student.id));
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.coursesAsOption && this.props.coursesAsOption !== nextProps.coursesAsOption) {
            this.setState({selectedCourse: nextProps.coursesAsOption[0]});
        }
    }

    toggleStudentSelect = student => e => {
        let createForm = this.state.createForm;

        this.setState({
            createForm: {
                ...this.state.createForm,
                selectedStudents: createForm.selectedStudents.includes(student) ? createForm.selectedStudents.filter(s => s !== student) : [...this.state.createForm.selectedStudents, student]
            }
        });
    };

    courseFilter = student => {
        return !this.state.createForm.selectedStudents.find(s => s.id === student.id);
    };

    onSelectLearningType = leadingType => {
        let contains = this.state.createForm.selectedLearningTypes.includes(leadingType);
        let selectedLearningTypes = contains ? this.state.createForm.selectedLearningTypes.filter(e => e !== leadingType) : [...this.state.createForm.selectedLearningTypes, leadingType];

        this.setState({
            createForm: {
                ...this.state.createForm,
                selectedLearningTypes
            },
            selectedLearningResults: {},
        });
    };

    onSelectLevel = level => {
        let contains = this.state.createForm.selectedLevels.includes(level);
        this.setState({
            createForm: {
                ...this.state.createForm,
                selectedLevels: contains ? this.state.createForm.selectedLevels.filter(e => e !== level) : [...this.state.createForm.selectedLevels, level]
            }
        });
    };

    nextStep = () => {
        this.setState({step: Math.min(this.state.step + 1, 2)})
    };

    prevStep = () => {
        this.setState({step: Math.max(0, this.state.step - 1)})
    };

    fetchCandidateCount = studentIds => {
        this.props.fetchCandidateCount({
            studentIds,
            ...this.state.scope
        });
    };

    createRemindLearnings = () => {
        this.setState({loading: true});
        Promise.all(Object.entries(this.props.candidateCount)
            .map(([studentId, candidateCountByDateNumber]) => {
                let learningResultsByStudent = Object.values(candidateCountByDateNumber).flatten().filter(l => this.state.selectedLearningResults[l.id]);
                return {studentId, learningResultsByStudent};
            })
            .map(({studentId, learningResultsByStudent}) => {
                let learningIds = learningResultsByStudent.map(r => r.id);
                let learningTypes = learningResultsByStudent.map(r => r.type);
                let levels = this.state.createForm.selectedLevels.map(e => e.value);
                if (learningIds.length > 0)
                    return this.props.createRemindLearning({studentId, learningIds, levels, learningTypes});
            })
            .filter(e => !!e))
            .then(createdList => {
                this.setState({createdList, loading: false});
            })
            .catch(e => {
                console.log(e);
                this.setState({loading: true});
                alert('출제 실패');
            });
    };

    createRemindLearningByStudent = (student, learningResults) => {
        let selectedLearningResults = {};
        learningResults.flatten().forEach(learningResult => {
            selectedLearningResults[learningResult.id] = learningResult;
        });

        this.setState({selectedLearningResults});
        this.openModal('createForm');
    };

    // TODO
    // [ ] 학생별 화면
    // [ ] 주 / 달 단위??
    // [ ] 상세한 생성 모달
    //  - [ ] 날짜 선택
    //  - [ ] 학습 타입 선택
    //  - [ ] 난이도 선택

    fetchPreviews = () => {
        this.setState({loading: true, previews: null});
        Promise.all(Object.entries(this.props.candidateCount)
            .map(([studentId, candidateCountByDateNumber]) => {
                let learningResultsByStudent = Object.values(candidateCountByDateNumber).flatten().filter(l => this.state.selectedLearningResults[l.id]);
                return {studentId, learningResultsByStudent};
            })
            .map(({studentId, learningResultsByStudent}) => {
                let learningIds = learningResultsByStudent.map(r => r.id);
                let learningTypes = learningResultsByStudent.map(r => r.type);
                let levels = this.state.createForm.selectedLevels.map(e => e.value);
                if (learningIds.length > 0)
                    return this.props.previewRemindLearning({studentId, learningIds, levels, learningTypes});
            })
            .filter(e => !!e))
            .then(previews => {
                this.setState({previews, loading: false});
            })
            .catch(e => {
                this.setState({loading: false});
            });
    };

    closeModal = modalName => {
        this.setState({
            modal: {
                [modalName]: false,
            },
            step: 0,
        });
    };

    openModal = modalName => {
        this.setState({
            modal: {
                [modalName]: true
            }
        });
    };

    openPrint = learning => () => {
        this.setState({isPopupBlocked: false});
        let url = `/print/remindLearnings?ids=${learning.id}`;
        let popup = window.open(url, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
        if (!popup || popup.closed || typeof popup.closed === 'undefined') this.setState({isPopupBlocked: true, blockedPopUpUrl: url});
    };

    openPrints = () => {
        let learningIds = this.state.createdList.map(l => l.learning.id);

        this.setState({isPopupBlocked: false});
        let url = `/print/remindLearnings?ids=${learningIds.join(',')}`;
        let popup = window.open(url, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
        if (!popup || popup.closed || typeof popup.closed === 'undefined') this.setState({isPopupBlocked: true, blockedPopUpUrl: url});
    };

    toggleLearningResults = (learningResult) => {
        this.selectLearningResult(learningResult, !this.isSelectedLearningResult(learningResult))
    };

    selectLearningResult = (learningResult, isSelect) => {
        this.setState({
            selectedLearningResults: {
                ...this.state.selectedLearningResults,
                [learningResult.id]: isSelect ? learningResult : false,
            }
        })
    };

    isSelectedLearningResult = (learningResult) => {
        return !!this.state.selectedLearningResults[learningResult.id];
    };

    selectAll = (dateNumber, isSelect = true) => {
        let learningResultsByDateNumber = this.findAllLearningResultsByDateNumber(dateNumber);
        if (learningResultsByDateNumber.length > 0) {
            let selectedLearningResults = {...this.state.selectedLearningResults};
            learningResultsByDateNumber.forEach(learningResult => {
                selectedLearningResults[learningResult.id] = isSelect ? learningResult : false;
            });
            this.setState({selectedLearningResults});
        }
    };

    toggleSelectAll = (dateNumber, isSelect) => this.selectAll(dateNumber, isSelect === undefined ? !this.isSelectedAll(dateNumber) : isSelect);

    isSelectedAll = dateNumber => {
        let learningResultsByDateNumber = this.findAllLearningResultsByDateNumber(dateNumber);
        if (learningResultsByDateNumber.length > 0)
            return learningResultsByDateNumber.map(r => r.id).every(id => {
                return !!this.state.selectedLearningResults[id];
            });
        return false;
    };

    findAllLearningResultsByDateNumber = dateNumber => {
        let {candidateCount} = this.props;
        if (!candidateCount) return [];
        return Object.values(candidateCount).map(a => a[dateNumber]).flatten().filter(e => !!e).filter(this.filterByLearningType);
    };

    isSelectableDay = dateNumber => this.findAllLearningResultsByDateNumber(dateNumber).length > 0;

    filterByLearningType = learningResult => this.state.createForm.selectedLearningTypes.map(t => t.value).includes(learningResult.type);

    onSelectCourse = course => {
        let students = course.value.students;
        this.setState({course: course.value, selectedCourse: course, students, selectedLearningResults: {}});
        this.fetchCandidateCount(students.map(student => student.id));
    };

    isActive = path => !!path.exec(this.props.location.pathname);

    render() {
        const {candidateCount, coursesAsOption = [], data = [], dateNumbers} = this.props;
        const {step, createForm, students, days, selectedLearningResults} = this.state;

        let selectedLearningTypeValues = createForm.selectedLearningTypes.map(t => t.value);

        let sortedStudents = students && students
            .map(student => {
                if (candidateCount && candidateCount[student.id])
                    return {student, learningResultCount: Object.values(candidateCount[student.id]).flatten().length};
            })
            .filter(s => s)
            .sort((a, b) => b.learningResultCount - a.learningResultCount)
            .map(s => s.student);

        return <DocumentTitle title='오답학습 beta'>
            <div style={{position: 'relative'}} className="remind-learnings">
                <div className="row">
                    <div className="column is-flex flex-3" style={{alignItems: 'baseline'}}>
                        <h2 className="mad-title-h2">오답학습&nbsp;<sup style={{color: '#e8496a'}}>beta</sup></h2>
                        &nbsp;<p>오답을 모아 문제지를 만들 수 있습니다</p>
                    </div>
                </div>
                <div className="tab-menu">
                    <Link to={`/teacher/remindLearningsV2`}>
                        <div className={`tab-button ${this.isActive(/\/teacher\/remindLearningsV2/) ? 'active' : ''}`}>학생별</div>
                    </Link>
                    <Link to={`/teacher/remindLearnings`}>
                        <div className={`tab-button ${this.isActive(/\/teacher\/remindLearnings$/) ? 'active' : ''}`}>수업별</div>
                    </Link>
                </div>
                <MadModal
                    isOpen={this.state.modal['createForm']}
                    onRequestClose={() => this.closeModal('createForm')}
                    closeButton={true}
                    shouldCloseOnOverlayClick={false}>
                    {
                        step === -3 &&
                        <div>
                            <MadSubTitle>학생 선택</MadSubTitle>
                            <Gap sm/>
                            {
                                students &&
                                <ManageStudentList
                                    students={students}
                                    title="학생 선택"
                                    filter={this.courseFilter}
                                    onActionButtonClick={this.toggleStudentSelect}
                                    emptyListText="해당하는 학생이 없습니다"/>
                            }
                            <div style={{display: 'flex', justifyContent: 'space-evenly', marginTop: 24}}>
                                <MadButton text="다음" onClick={this.nextStep}/>
                            </div>
                        </div>
                    }
                    {
                        step === -2 &&
                        <div>
                            <MadSubTitle>기간</MadSubTitle>
                            <Gap sm/>
                            <div style={{width: 200}}>
                                <DateRangePicker
                                    startDate={createForm.startDate} // momentPropTypes.momentObj or null,
                                    endDate={createForm.endDate} // momentPropTypes.momentObj or null,
                                    onDatesChange={({startDate, endDate}) => this.setState({startDate, endDate})}
                                    // focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                                    onFocusChange={focusedInput => this.setState({focusedInput})} // PropTypes.func.isRequired,
                                    keepOpenOnDateSelect={true}
                                    numberOfMonths={1}
                                />
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-evenly', marginTop: 24}}>
                                <MadButton text="이전" onClick={this.prevStep} ghost/>
                                <MadButton text="다음" onClick={this.nextStep}/>
                            </div>
                        </div>
                    }
                    {
                        step === -1 &&
                        <div>
                            <MadSubTitle>구성</MadSubTitle>
                            <Gap sm/>
                            <SimpleRowList>
                                <MadLabeled label="학습 타입" labelAlign="left" labelWidth="25%">
                                    <MadButtonGroup
                                        className="is-flex"
                                        values={createForm.selectedLearningTypes}
                                        options={LearningTypes.options}
                                        clearable={false}
                                        multiSelect={true}
                                        size="xs"
                                        onChange={this.onSelectLearningType}/>
                                </MadLabeled>
                            </SimpleRowList>
                            <div style={{display: 'flex', justifyContent: 'space-evenly', marginTop: 24}}>
                                <MadButton text="이전" onClick={this.prevStep} ghost/>
                                <MadButton text="다음" onClick={this.nextStep}/>
                            </div>
                        </div>
                    }
                    {
                        step === 0 &&
                        <div>
                            <MadSubTitle>구성</MadSubTitle>
                            <Gap sm/>
                            <SimpleRowList>
                                <MadLabeled label="난이도" labelAlign="left" labelWidth="25%">
                                    <MadButtonGroup
                                        values={createForm.selectedLevels}
                                        options={Level}
                                        clearable={false}
                                        multiSelect={true}
                                        size='sm'
                                        onChange={this.onSelectLevel}/>
                                </MadLabeled>
                            </SimpleRowList>
                            <div style={{display: 'flex', justifyContent: 'space-evenly', marginTop: 24}}>
                                {
                                    this.state.isFullStep && // TODO 오직 모달로만 생성하려고 하는 경우
                                    <MadButton text="이전" onClick={this.prevStep} ghost/>
                                }
                                <MadButton text="다음" onClick={() => {
                                    this.nextStep();
                                    this.fetchPreviews();
                                }}/>
                            </div>
                        </div>
                    }
                    {
                        step === 1 &&
                        <div>
                            <MadSubTitle>미리보기</MadSubTitle>
                            <Gap sm/>
                            {
                                this.state.previews &&
                                this.state.previews.filter(p => !!p).length > 0 &&
                                <div>
                                    <span className="preview-result-info"><i className="mdi mdi-ok"/>학생별로 오답학습 {this.state.previews.filter(p => !!p).length}개가 출제됩니다</span>
                                    {
                                        this.state.previews.length - this.state.previews.filter(p => !!p).length > 0 &&
                                        <div className="preview-warning">선택 옵션에 의해 학생{this.state.previews.length - this.state.previews.filter(p => !!p).length}명이 제외되었습니다</div>
                                    }
                                    {
                                        sortedStudents.map((student, i) => {
                                            let studentIds = Object.entries(this.props.candidateCount)
                                                .map(([studentId, candidateCountByDateNumber]) => {
                                                    let learningResultsByStudent = Object.values(candidateCountByDateNumber).flatten().filter(l => selectedLearningResults[l.id]);
                                                    if (learningResultsByStudent.length > 0)
                                                        return parseInt(studentId);
                                                })
                                                .filter(r => !!r);

                                            if (studentIds.includes(student.id)) {
                                                let preview = this.state.previews.filter(p => !!p).find(p => p.student.id === student.id);
                                                if (preview) {
                                                    return <div className="remind-learning-preview" key={student.id + "-" + i}>
                                                        <span>{preview.student.nickname}</span><span>{preview.totalUnitCount}<span className="postfix">&nbsp;문제</span></span>
                                                    </div>;
                                                } else {
                                                    return <div className="remind-learning-preview warning" key={student.id + "-" + i + "w"}>
                                                        <span>{student.nickname}</span><span>오답 없음</span>
                                                    </div>
                                                }
                                            }
                                        })
                                    }
                                </div>
                            }
                            {
                                (!this.state.previews ||
                                    this.state.previews.filter(p => !!p).length === 0) &&
                                <div>
                                    출제할 수 없습니다. 학습 타입 또는 기간, 난이도를 조절해주세요.
                                </div>
                            }
                            <div style={{display: 'flex', justifyContent: 'space-evenly', marginTop: 24}}>
                                <MadButton text="이전" onClick={this.prevStep} ghost/>
                                <MadButton text="출제" onClick={() => {
                                    this.nextStep();
                                    this.createRemindLearnings();
                                }} disabled={!this.state.previews || this.state.previews.filter(p => !!p).length === 0}/>
                            </div>
                        </div>
                    }
                    {
                        step === 2 &&
                        <div>
                            <MadSubTitle>출제 완료</MadSubTitle>
                            <div className="complete-message">
                                <p>
                                    <i className="mdi mdi-check"/>오답학습 출제가 완료되었습니다
                                </p>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-evenly', marginTop: 24}}>
                                <MadButton text="닫기" onClick={e => this.closeModal('createForm')} ghost/>
                                <MadButton text="모두 출력" onClick={e => this.openPrints()}/>
                            </div>
                        </div>
                    }
                </MadModal>
                <div className="card">
                    <div className="row">
                        <div className="column is-12">
                            <div className="is-flex">
                                <MadSelect
                                    className="flex-1"
                                    placeholder="수업 선택..."
                                    value={this.state.selectedCourse}
                                    options={coursesAsOption}
                                    searchable={true}
                                    clearable={false}
                                    onChange={this.onSelectCourse}
                                />
                                <div className="flex-2" style={{
                                    justifyContent: 'space-between',
                                    display: 'flex',
                                    paddingLeft: 8,
                                }}>
                                    <MadButtonGroup
                                        className="is-flex"
                                        values={createForm.selectedLearningTypes}
                                        options={LearningTypes.options}
                                        clearable={false}
                                        multiSelect={true}
                                        size="xs"
                                        onChange={this.onSelectLearningType}/>
                                    <MadButton text="오답 학습 만들기" xs onClick={e => this.openModal('createForm')} disabled={Object.values(selectedLearningResults).every(e => !e)}/>
                                </div>
                            </div>
                            <div>
                                {
                                    days && days.map(m => {
                                        let day = m.day();
                                        let dateNumber = m.format('YYYYMMDD');

                                        return <div className="calendar-days" style={{
                                            color: day === 6 ? '#4d4dff' : (day === 0 ? '#ff4d4d' : 'gray')
                                        }} key={dateNumber} onClick={() => this.toggleSelectAll(dateNumber)}>
                                            <MadCheckbox checked={this.isSelectedAll(dateNumber)} onChange={() => {
                                            }} disabled={!this.isSelectableDay(dateNumber)}/>
                                            <span style={{fontSize: '2em'}}>{m.format('DD')}</span>
                                            <span style={{fontSize: '0.8em'}}>{m.format('ddd')}</span>
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    {
                        sortedStudents &&
                        sortedStudents.map(student => {
                            let studentData = data.find(s => s.studentId === student.id);
                            let totalLearningResultCount = 0;
                            let learningBadgeTableData = days
                                .map(day => {
                                    let dateNumber = parseInt(day.format('YYYYMMDD'));
                                    let learningResults = candidateCount &&
                                        candidateCount[student.id] &&
                                        candidateCount[student.id][dateNumber] &&
                                        candidateCount[student.id][dateNumber].filter(learningResult => {
                                            return selectedLearningTypeValues.includes(learningResult.type);
                                        }) || [];
                                    totalLearningResultCount += learningResults.length;
                                    return {day, learningResults};
                                });

                            return <div className="row student-row" key={student.id}>
                                <div className="column is-12">
                                    <div>
                                        <MadSubTitle text={student.nickname} style={{margin: '8px 0', fontSize: 16}}/>
                                        <LearningBadgeTable learningBadgeTableData={learningBadgeTableData}
                                                            totalLearningResultCount={totalLearningResultCount}
                                                            toggleLearningResults={this.toggleLearningResults}
                                                            isSelectedLearningResult={this.isSelectedLearningResult}/>
                                    </div>
                                    <div>
                                        {
                                            studentData &&
                                            <RemindLearningTable studentData={studentData} dateNumbers={dateNumbers} openPrint={this.openPrint}/>
                                        }
                                        {
                                            !studentData &&
                                            totalLearningResultCount !== 0 &&
                                            <div style={{
                                                textAlign: 'center',
                                                margin: 8
                                            }}>
                                                <MadButton text="오답 학습 만들기" xs secondary onClick={e => this.createRemindLearningByStudent(student, learningBadgeTableData.map(l => l.learningResults))}/>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        })
                    }
                    {
                        students &&
                        students.length === 0 &&
                        <div style={{textAlign: 'center', color: 'gray', margin: 16}}>
                            수업에 학생이 없습니다
                        </div>
                    }
                </div>
            </div>
        </DocumentTitle>
    }
}

class LearningBadgeTable extends React.PureComponent {
    render() {
        const {learningBadgeTableData, totalLearningResultCount, toggleLearningResults, isSelectedLearningResult} = this.props;
        if (totalLearningResultCount > 0)
            return <div className="flex-space-around learning-badge-table">
                {
                    learningBadgeTableData.map(({day, learningResults}, i) => {
                        return <div key={i}>
                            {
                                learningResults.map(learningResult => {
                                    return <LearningResultBadge learningResult={learningResult}
                                                                onClick={e => toggleLearningResults(learningResult)}
                                                                isSelected={isSelectedLearningResult(learningResult)}
                                                                key={learningResult.id}/>
                                })
                            }
                        </div>
                    })
                }
            </div>;
        return <div style={{textAlign: 'center', color: 'gray', marginTop: -22}}>오답 없음</div>
    }
}

class RemindLearningTable extends React.PureComponent {
    render() {
        const {studentData, dateNumbers, openPrint} = this.props;

        return studentData.rows.map((row, i) => {
            let lastIndex = 0;
            return <div key={i}>
                {
                    row.map(remindLearning => {
                        let learningDateNumbers = Object.keys(remindLearning.learningResults).map(n => parseInt(n));
                        let minDateNumber = learningDateNumbers.minValue();
                        let maxDateNumber = learningDateNumbers.maxValue();

                        let minIndex = dateNumbers.indexOf(minDateNumber);
                        let maxIndex = dateNumbers.indexOf(maxDateNumber);

                        let colSize = 100 / dateNumbers.length;
                        let widthCount = maxIndex - minIndex + 1;
                        let isOver = false;

                        if (minIndex < 0) {
                            if (widthCount === 1) return;
                            else {
                                widthCount = maxIndex + 1;
                                minIndex = Math.max(minIndex, 0);
                                isOver = true;
                            }
                        }

                        let width = widthCount * colSize;
                        let marginLeft = (minIndex - lastIndex) * colSize;
                        let columns = Array(widthCount).fill(0);

                        lastIndex = maxIndex + 1;

                        return <div style={{marginLeft: `calc(${marginLeft}% + 4px)`, width: `calc(${width}% - 8px)`, display: 'inline-block'}} className={`remind-learning ${isOver ? 'over' : ''}`} key={remindLearning.id}>
                            <h4>
                                <div style={{display: 'inline-block', verticalAlign: 'bottom', marginLeft: 4}}>
                                    <span className="learning-id-badge">#{remindLearning.id}</span>
                                    오답학습
                                    {
                                        remindLearning.complete &&
                                        <span className="score-badge">{remindLearning.score}점</span>
                                    }
                                </div>
                                <div style={{float: 'right',}}>
                                    <i className="mdi mdi-printer" style={{
                                        fontSize: '18px',
                                        color: '#757575',
                                    }} onClick={openPrint(remindLearning)}/>
                                    {/*<MadDropdown alignRight>*/}
                                    {/*<i className="mdi mdi-dots-vertical" style={{*/}
                                    {/*fontSize: '18px',*/}
                                    {/*color: '#757575',*/}
                                    {/*}}/>*/}
                                    {/*/!*<li onClick={this.openPrint(remindLearning)}>채점</li>*!/*/}
                                    {/*<li onClick={this.openPrint(remindLearning)}>출력</li>*/}
                                    {/*</MadDropdown>*/}
                                </div>
                            </h4>
                            {/*<div className="learning-info">*/}
                            {/*<span className="unit-count">{remindLearning.totalUnitCount}</span>문제*/}
                            {/*</div>*/}
                            <div>
                                {
                                    columns.map((_, i) => {
                                        return <div style={{width: `${colSize * 100 / width}%`, float: 'left', minHeight: 1}} key={i}>
                                            {
                                                Object.entries(remindLearning.learningResults).map(([dateNumber, learningResults]) => {
                                                    let offsetIndex = Math.max(0, dateNumbers.indexOf(parseInt(dateNumber)) - minIndex);
                                                    if (offsetIndex === i) {
                                                        return learningResults.map(learningResult => {
                                                            return <LearningResultBadge key={learningResult.id} learningResult={learningResult} disabled/>
                                                        })
                                                    }
                                                })
                                            }
                                        </div>
                                    })
                                }
                            </div>
                        </div>
                    })
                }
            </div>;
        });
    }
}


class LearningResultBadge extends React.PureComponent {
    LearningTypeNames = {
        'RECOMMEND': '클',
        'OPEN_HOMEWORK': '문',
        'HOMEWORK': '과',
        'REMIND': '오',
        'TEXTBOOK': '교',
    };

    render() {
        const {learningResult, isSelected, disabled, onClick} = this.props;

        return <div className={`learning-result-badge learning-type-${learningResult.type} ${isSelected ? 'selected' : ''}`} onClick={onClick}>
            {
                !disabled && <MadCheckbox checked={isSelected} onChange={() => {
                }}/>
            }
            {this.LearningTypeNames[learningResult.type]}{learningResult.wrongUnitCount}
        </div>
    }
}
