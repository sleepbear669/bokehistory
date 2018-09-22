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
import {DateRangePicker} from "react-dates";
import {Level} from '../../../shared/homeworkType';
import {Link} from "react-router-dom";
import ChapterPicker from "../../components/ChapterPicker";
import {Chapters} from "../../../shared/courseOption";

const LearningTypes = {
    options: [
        // {label: '교재학습', value: 'TEXTBOOK', icon: 'checkbox-blank-outline', activeIcon: 'checkbox-marked', iconSize: 15},
        {label: '오답클리닉', value: 'RECOMMEND', icon: 'checkbox-blank-outline', activeIcon: 'checkbox-marked', iconSize: 15},
        {label: '수업과제', value: 'HOMEWORK', icon: 'checkbox-blank-outline', activeIcon: 'checkbox-marked', iconSize: 15},
        {label: '문제은행', value: 'OPEN_HOMEWORK', icon: 'checkbox-blank-outline', activeIcon: 'checkbox-marked', iconSize: 15},
        // {label: '오답학습', value: 'REMIND', icon: 'checkbox-blank-outline', activeIcon: 'checkbox-marked', iconSize: 15},
    ]
};

const openModal = state => ({modal: {...state.modal, isOpen: true}});

const closeModal = state => ({modal: {...state.modal, isOpen: false}});

const setCurrentStudent = student => state => ({
    modal: {
        ...state.modal,
        student
    }
});

const updateModalData = data => state => ({
    modal: {
        ...state.modal,
        ...data
    }
});

export default class RemindLearnings extends PureComponent {
    state = {
        modal: {
            isOpen: false,
            student: null,
            selectedLevels: [...Level],
            selectedLearningTypes: [...LearningTypes.options],
            selectedChapters: [],
        },
    };

    componentDidMount() {
        this.props.fetchRemindLearnings();
    }

    openCreateModal = (student) => () => {
        this.setState(openModal);
        this.setState(setCurrentStudent(student));
    };

    closeCreateModal = () => this.setState(closeModal);

    onSelectLearningType = leadingType => {
        let contains = this.state.modal.selectedLearningTypes.includes(leadingType);
        let selectedLearningTypes = contains ? this.state.modal.selectedLearningTypes.filter(e => e !== leadingType) : [...this.state.modal.selectedLearningTypes, leadingType];
        if (selectedLearningTypes.length === 0) return;

        this.setState(updateModalData({selectedLearningTypes}));
    };

    onSelectLevel = level => {
        let contains = this.state.modal.selectedLevels.includes(level);
        let selectedLevels = contains ? this.state.modal.selectedLevels.filter(e => e !== level) : [...this.state.modal.selectedLevels, level];
        if (selectedLevels.length === 0) return;

        this.setState(updateModalData({selectedLevels}), this.fetchPreview);
    };

    onSelectChapters = selectedChapters => {
        this.setState(updateModalData({selectedChapters}), this.fetchPreview);
    };

    fetchPreview = () => {
        const {candidateCount} = this.props;
        const studentId = this.state.modal.student.id;
        const learnings = Object.values(candidateCount[studentId]).flatten(2).filter(this.filterByLearningType);

        if (learnings.length > 0) {
            const learningIds = learnings.map(l => l.id);
            const learningTypes = this.state.modal.selectedLearningTypes.map(t => t.value);
            const levels = this.state.modal.selectedLevels.map(l => l.value);
            const leafChapterIds = this.state.modal.selectedChapters.map(c => c.contentId);
            this.props.previewRemindLearning({studentId, learningIds, levels, learningTypes, leafChapterIds});
        }
    };

    createRemindLearning = () => {
        const {candidateCount} = this.props;
        const studentId = this.state.modal.student.id;
        const learnings = Object.values(candidateCount[studentId]).flatten(2).filter(this.filterByLearningType);

        if (learnings.length > 0) {
            const learningIds = learnings.map(l => l.id);
            const learningTypes = this.state.modal.selectedLearningTypes.map(t => t.value);
            const levels = this.state.modal.selectedLevels.map(l => l.value);
            const leafChapterIds = this.state.modal.selectedChapters.map(c => c.contentId);
            return this.props.createRemindLearning({studentId, learningIds, levels, learningTypes, leafChapterIds});
        }
        return null;
    };

    openPrint = (learning) => () => {
        this.setState({isPopupBlocked: false});
        let url = `/print/remindLearnings?ids=${learning.id}`;
        let popup = window.open(url, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
        if (!popup || popup.closed || typeof popup.closed === 'undefined') this.setState({isPopupBlocked: true, blockedPopUpUrl: url});
    };

    filterByLearningType = learning => this.state.modal.selectedLearningTypes.map(t => t.value).includes(learning.type);

    isActive = path => !!path.exec(this.props.location.pathname);

    render() {
        const {students, remindLearningsGroupByStudent, fetchCandidateCount, candidateCount, preview, createResult} = this.props;

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
                <div className="card">
                    {
                        students.map(student => {
                            return <div className="row" key={student.id}>
                                <div className="column is-12">
                                    <div key={student.id} className="remind-learning-list-group-header">
                                        <span>{`${student.nickname}`}</span>&nbsp;
                                        <MadButton text="오답학습 만들기" ghost xs onClick={this.openCreateModal(student)}/>
                                    </div>
                                    {
                                        remindLearningsGroupByStudent &&
                                        remindLearningsGroupByStudent[student.id] &&
                                        <React.Fragment>
                                            <div className="row remind-learning-list-item is-gapless is-vcentered bottom-line-light simple-list-item">
                                                <div className="column is-2 padding-cell">생성일</div>
                                                <div className="column is-4 padding-cell">학습</div>
                                                <div className="column is-4 padding-cell">학습기간</div>
                                                <div className="column is-2 padding-cell"/>
                                            </div>
                                            {
                                                remindLearningsGroupByStudent[student.id].map(learning => {
                                                    return <RemindLearningListItem learning={learning} openPrint={this.openPrint} key={learning.id}/>
                                                })
                                            }
                                        </React.Fragment>
                                    }
                                </div>
                            </div>
                        })
                    }
                </div>
                <RemindLearningCreateModal {...this.state.modal} closeModal={this.closeCreateModal}
                                           fetchCandidateCount={fetchCandidateCount}
                                           candidateCount={candidateCount}
                                           preview={preview}
                                           fetchPreview={this.fetchPreview}
                                           filterByLearningType={this.filterByLearningType}
                                           onSelectLearningType={this.onSelectLearningType}
                                           onSelectLevel={this.onSelectLevel}
                                           onSelectChapters={this.onSelectChapters}
                                           createRemindLearning={this.createRemindLearning}
                                           createResult={createResult}
                                           fetchTopChapters={this.props.fetchTopChapters}
                                           chapters={this.props.chapters}/>
            </div>
        </DocumentTitle>
    }
}

class RemindLearningCreateModal extends PureComponent {
    state = {
        step: 0,
        startDate: moment(new Date()).startOf('day').add(-14, 'days'),
        endDate: moment(new Date()).endOf('day'),
        focusedInput: null,
        chapterPickerModal: {
            isOpen: false,
        }
    };

    componentDidUpdate(prevProps, prevState) {
        if (this.props.selectedLearningTypes !== prevProps.selectedLearningTypes)
            this.props.fetchPreview();
        else if (this.props.student !== prevProps.student || this.state.startDate !== prevState.startDate || this.state.endDate !== prevState.endDate)
            this.props.fetchCandidateCount({studentIds: [this.props.student.id], startDate: this.state.startDate, endDate: this.state.endDate}).then(r => {
                this.props.fetchPreview();
            });
    }

    nextStep = () => this.setState({step: Math.min(1, this.state.step + 1)});

    onClickCreate = () => {
        this.props.createRemindLearning().then(r => {
            this.nextStep();
        }).catch(e => {
            alert("생성 실패");
        });
    };

    openPrint = () => {
        if (this.props.createResult) {
            let learning = this.props.createResult.learning;
            this.setState({isPopupBlocked: false});
            let url = `/print/remindLearnings?ids=${learning.id}`;
            let popup = window.open(url, "popup", "width=900, height=700, toolbar=no, menubar=no, scrollbars=yes, resizable=0, copyhistory=no");
            if (!popup || popup.closed || typeof popup.closed === 'undefined') this.setState({isPopupBlocked: true, blockedPopUpUrl: url});
        }
    };

    onCloseModal = () => {
        this.props.closeModal();
        this.setState({step: 0});
    };

    render() {
        const {
            isOpen,
            student,
            candidateCount,
            onSelectLearningType,
            onSelectLevel,
            onSelectChapters,
            filterByLearningType,
            preview,
            createResult,
            fetchTopChapters,
            chapters,
            selectedChapters
        } = this.props;
        const {step, startDate, endDate, chapterPickerModal} = this.state;

        let candidateCountSum = 0;
        if (candidateCount && student && candidateCount[student.id])
            candidateCountSum = Object.entries(candidateCount[student.id]).flatMap(([d, learnings]) => learnings).filter(filterByLearningType).map(l => l.wrongUnitCount).sum();

        return <MadModal
            isOpen={isOpen}
            onRequestClose={this.onCloseModal}
            closeButton={true}
            shouldCloseOnOverlayClick={false}>
            {
                student &&
                <div>
                    {
                        step === 0 &&
                        <div>
                            <MadSubTitle>{student.nickname}학생의 오답학습 만들기 - 구성</MadSubTitle>
                            <Gap sm/>
                            <SimpleRowList>
                                <MadLabeled label="학습기간" labelAlign="right" labelWidth="20%">
                                    <DateRangePicker
                                        startDate={startDate}
                                        endDate={endDate}
                                        onDatesChange={({startDate, endDate}) => this.setState({startDate, endDate})}
                                        focusedInput={this.state.focusedInput}
                                        onFocusChange={focusedInput => this.setState({focusedInput})}
                                        keepOpenOnDateSelect={true}
                                        numberOfMonths={1}
                                        isOutsideRange={() => false}/>
                                </MadLabeled>
                                <MadLabeled label="학습타입" labelAlign="right" labelWidth="20%">
                                    <MadButtonGroup
                                        className="is-flex"
                                        values={this.props.selectedLearningTypes}
                                        options={LearningTypes.options}
                                        clearable={false}
                                        multiSelect={true}
                                        onChange={onSelectLearningType}/>
                                </MadLabeled>
                            </SimpleRowList>
                            <Gap line/>
                            <div>
                                <div className="candidate-item" style={{color: 'gray'}}>
                                    <div className="title">날짜</div>
                                    <div className="learnings-container">
                                        오답 문항수
                                        <div style={{display: 'inline-block', padding: '0 4px', margin: '0 4px', fontSize: 10, borderRadius: 4}} className="learning-types-RECOMMEND">오답클리닉</div>
                                        <div style={{display: 'inline-block', padding: '0 4px', margin: '0 4px', fontSize: 10, borderRadius: 4}} className="learning-types-OPEN_HOMEWORK">문제은행</div>
                                        <div style={{display: 'inline-block', padding: '0 4px', margin: '0 4px', fontSize: 10, borderRadius: 4}} className="learning-types-HOMEWORK">수업과제</div>
                                    </div>
                                </div>
                                {
                                    candidateCount &&
                                    candidateCount[student.id] &&
                                    Object.entries(candidateCount[student.id]).map(CandidatesItem(filterByLearningType))
                                }
                                <div className="candidate-item" style={{color: 'gray'}}>
                                    <div className="title"/>
                                    <div className="learnings-container">{candidateCountSum}문항</div>
                                </div>
                            </div>
                            <Gap line/>
                            <SimpleRowList>
                                <MadLabeled label="난이도 필터" labelAlign="right" labelWidth="20%">
                                    <MadButtonGroup
                                        values={this.props.selectedLevels}
                                        options={Level}
                                        clearable={false}
                                        multiSelect={true}
                                        onChange={onSelectLevel}/>
                                </MadLabeled>
                                <MadLabeled label="단원 필터" labelAlign="right" labelWidth="20%">
                                    {
                                        selectedChapters.length > 0 &&
                                        <span className="chapter-selected-counts">{selectedChapters.length}개 선택됨</span>
                                    }
                                    <MadButton text="단원 선택..." ghost onClick={() => this.setState({chapterPickerModal: {isOpen: true}})}/>
                                    <MadModal
                                        isOpen={chapterPickerModal.isOpen}
                                        onRequestClose={() => this.setState({chapterPickerModal: {isOpen: false}})}
                                        closeButton={true}
                                        size="lg"
                                        shouldCloseOnOverlayClick={false}>
                                        <MadSubTitle>단원 필터</MadSubTitle>
                                        <Gap sm/>
                                        <MultiChapterPicker fetchTopChapters={fetchTopChapters} chapters={chapters} selectedChapters={selectedChapters} onSelectChange={onSelectChapters}/>
                                        <div style={{display: 'flex', justifyContent: 'space-evenly', marginTop: 24}}>
                                            <MadButton text="확인" onClick={() => this.setState({chapterPickerModal: {isOpen: false}})}/>
                                        </div>
                                    </MadModal>
                                </MadLabeled>
                                {
                                    preview && candidateCountSum > 0 &&
                                    <React.Fragment>
                                        <span className="preview-result-info"><i className="mdi mdi-check"/>&nbsp;{preview.totalUnitCount}문제가 출제됩니다</span>
                                    </React.Fragment>
                                }
                            </SimpleRowList>
                            <div style={{display: 'flex', justifyContent: 'center'}}>
                                {
                                    preview && candidateCountSum > 0 &&
                                    <MadButton text="출제하기" onClick={this.onClickCreate}/>
                                }
                                {
                                    (candidateCountSum === 0 || !preview) &&
                                    <span>학습기간이나 학습타입, 난이도에 해당하는 오답문항이 없습니다.</span>
                                }
                            </div>
                        </div>
                    }
                    {
                        step === 1 &&
                        <div>
                            <MadSubTitle>출제 완료</MadSubTitle>
                            <div className="complete-message">
                                {
                                    createResult &&
                                    createResult.success &&
                                    <p>
                                        <i className="mdi mdi-check"/>오답학습 출제가 완료되었습니다
                                    </p>
                                }
                                {
                                    createResult &&
                                    !createResult.success &&
                                    <p>출제 실패</p>
                                }
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-evenly', marginTop: 24}}>
                                <MadButton text="닫기" onClick={this.onCloseModal} ghost/>
                                <MadButton text="출력" onClick={this.openPrint}/>
                            </div>
                        </div>
                    }
                </div>
            }
        </MadModal>
    }
}

const CandidatesItem = filterByLearningType => ([dateNumber, learnings], i) => {
    const filteredLearnings = learnings.filter(filterByLearningType);
    if (filteredLearnings.length > 0)
        return <div className="candidate-item" key={i}>
            <div className="title">
                <MadLocalDateFormat localDate={moment(`${dateNumber}`)}/>
            </div>
            <div className="learnings-container">
                {
                    filteredLearnings.map(learning => {
                        return <span className={`learning-item learning-types-${learning.type}`} key={learning.id}>{learning.wrongUnitCount}</span>
                    })
                }
            </div>
        </div>;
    return null;
};

class RemindLearningListItem extends PureComponent {
    render() {
        const {learning, openPrint} = this.props;
        let createdText = '';
        if (learning.createdDate) {
            let termText = new Date(learning.createdDate).termText();
            if (termText[2] <= 2) createdText = `${termText[0]}${termText[1]}`
        }

        return <div className="row remind-learning-list-item is-gapless is-vcentered bottom-line-light simple-list-item">
            <div className="column is-2 padding-cell"><MadLocalDateFormat localDate={learning.createdDate}/></div>
            <div className="column is-4 padding-cell">
                {
                    createdText &&
                    <span style={{color: '#ff6633', fontSize: '0.7em', display: 'block'}}>{createdText}&nbsp;출제</span>
                }
                오답학습 #{learning.id}
            </div>
            <div className="column is-4 padding-cell"><MadLocalDateFormat startLocalDate={learning.createOption.dateRange.start} endLocalDate={learning.createOption.dateRange.end} range={true}/></div>
            <div className="column is-2 padding-cell">
                <MadButton text="출력" ghost sm onClick={openPrint(learning)}/>
            </div>
        </div>
    }
}

class MultiChapterPicker extends PureComponent {
    state = {
        selectedRootChapter: Chapters[0],
    };

    componentDidMount() {
        this.onSelectRootChapter(Chapters[0]);
    }

    onSelectRootChapter = selectedRootChapter => {
        this.setState({selectedRootChapter});
        this.props.fetchTopChapters(selectedRootChapter.value[selectedRootChapter.value.length - 1]);
    };

    deselect = chapter => e => {
        const selectedChapters = this.props.selectedChapters.filter(c => c !== chapter);
        this.props.onSelectChange(selectedChapters);
    };

    clear = e => {
        this.props.onSelectChange([]);
    };

    addAll = e => {
        this.props.onSelectChange([...this.props.selectedChapters, ...this.props.chapters.flatMap(c => c.leafChapters)].distinctBy(c => c.contentId));
    };

    render() {
        const {chapters, selectedChapters} = this.props;

        return <div className="MultiChapterPicker">
            <div className="chapter-select-box">
                <div className="rootchpater-select">
                    <MadSelect
                        placeholder="과정선택 / 검색"
                        value={this.state.selectedRootChapter}
                        options={Chapters}
                        searchable={true}
                        clearable={true}
                        shouldCloseOnOverlayClick={false}
                        pageSize={2}
                        onChange={this.onSelectRootChapter}
                    />
                    <MadButton text="모두 선택" onClick={this.addAll} ghost xs/>
                </div>
                <Gap line={true}/>
                <ChapterPicker chapters={chapters}
                               selectedChapters={selectedChapters}
                               onSelectChapters={this.props.onSelectChange}/>
            </div>
            <Gap h line height="unset"/>
            <div className="chapter-select-box">
                <h3 className="selected-list-header">
                    선택한 단원&nbsp;(<span>{selectedChapters.length}</span>개)&nbsp;
                    <MadButton text="초기화" onClick={this.clear} ghost xs/>
                </h3>
                <Gap line={true}/>
                <ul className="selected-list-body">
                    {
                        selectedChapters.map(chapter => {
                            return <li className="selected-chapter-item" key={chapter.contentId}>
                                <span>{chapter.name}</span>
                                <span style={{float: 'right'}} className="mdi mdi-close" onClick={this.deselect(chapter)}/>
                            </li>
                        })
                    }
                </ul>
            </div>
        </div>
    }
}
