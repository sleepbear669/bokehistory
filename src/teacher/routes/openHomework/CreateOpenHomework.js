import React, {PureComponent} from "react";
import "./OpenHomework.scss";
import {Chapters} from "shared/courseOption";
import {ExpandToChapter, Level} from "shared/homeworkType";
import moment from "moment";
import HomeworkSetting from "../../components/HomeworkSetting";
import HomeworkStructure from "../../components/HomeworkStructure";
import SelectUnit from "../../components/SelectUnit";
import ChapterPicker from "../../components/ChapterPicker";
import {
    Gap,
    MadButton,
    MadLabeled,
    MadModal,
    MadSelect,
    MadSubTitle
} from "madComponents";

const TOTAL_UNIT_COUNT_LIMIT = 50;

export default class CreateOpenHomework extends PureComponent {
    state = {
        modal: {},
        progress: {},
        isTopChapterLoaded: false,
    };

    componentDidMount() {
        this.init();
    }

    init = () => {
        this.setState({
            modal: {},
            progress: {},
            isTopChapterLoaded: false,
            step: 1,
            title: "",
            levels: [-1, 1, 2, 3],
            totalUnitLimit: TOTAL_UNIT_COUNT_LIMIT,
            maxCandidateCount: TOTAL_UNIT_COUNT_LIMIT,
            students: [],
            selectedTextbookPages: [],
            selectedCourse: null,
            selectedChapters: [],
            selectedTextbookFilter: null,
            selectedTextbookFilterValue: null,
            expandToChapter: true,
            selectedExpandToChapter: ExpandToChapter[0],
            selectedLevel: [...Level],
            startDate: moment(new Date()),
            endDate: moment(new Date()).add(7, 'days'),
            candidatesCount: 0,
        })

    };

    closeCreateOpenHomework = () => {
        this.props.closeModal('createOpenHomework');
        this.init();
    };

    openModal = name => {
        this.setState({modal: {...this.state.modal, [name]: true}})
    };

    closeModal = name => {
        this.setState({modal: {...this.state.modal, [name]: false}})
    };

    activeProgress = name => {
        this.setState({progress: {...this.state.progress, [name]: true}})
    };

    deactiveProgress = name => {
        this.setState({progress: {...this.state.progress, [name]: false}})
    };

    onSelectCourse = selectedOption => {
        this.setState({
            ...this.state,
            selectedCourse: selectedOption ? selectedOption : null,
            title: selectedOption ? selectedOption.label : null,
            selectedChapters: [],
        });

        if (selectedOption)
            this.props.fetchSchoolBooks(selectedOption.value[selectedOption.value.length - 1]);

        if (selectedOption)
            this.fetchTopChapters(selectedOption.value[selectedOption.value.length - 1])
    };

    getTextbookFilterOption = () => {
        const schoolBooks = this.props.schoolBooks;
        return schoolBooks && Object.keys(schoolBooks).map(key => ({label: key, value: schoolBooks[key]}));
    };

    onSelectTextbookFilter = selected => {
        this.setState({
            selectedChapters: [],
            selectedTextbookFilter: selected,
            selectedTextbookFilterValue: selected ? selected.value : null,
        });
    };

    fetchTopChapters = (topChapterId) => {
        this.activeProgress('fetchTopChapters');
        return this.props.fetchTopChapters(topChapterId)
            .then(r => {
                this.setState({
                    ...this.state,
                    isTopChapterLoaded: true,
                });
                this.deactiveProgress('fetchTopChapters');
            })
            .catch(e => {
                this.deactiveProgress('fetchTopChapters');
            });
    };

    updateState = (field, value) => {
        this.setState({
            [field]: value,
        })
    };

    updateStates = state => {
        this.setState({
            ...state,
        })
    };

    makeCandidatesHomeworkParams = () => {
        return {
            courseId: null,
            title: this.state.title,
            textbookPages: null,
            levels: this.state.selectedLevel.map(l => l.value),
            levelsRatio: [25, 25, 25, 25],
            students: [],
            leafChapterIds: this.state.selectedChapters.map(sc => sc.contentId),
            countLimitOfEachUnitGroup: 3,
            totalUnitLimit: this.state.totalUnitLimit,
            startDate: this.state.startDate,
            endDate: this.state.endDate,
            wrongUnitsFirst: false,
            expandToChapter: true,
        };
    };

    fetchCandidatesForCounting = () => {
        this.activeProgress('fetchCandidatesForCounting');
        return this.props.fetchOpenHomeworkCandidates({
            ...this.makeCandidatesHomeworkParams(),
            totalUnitLimit: TOTAL_UNIT_COUNT_LIMIT,
        }).then(r => {
            this.deactiveProgress('fetchCandidatesForCounting');
            this.setState({
                totalUnitLimit: r.units.length,
                candidatesCount: r.units.length,
                maxCandidateCount: r.units.length,
            });
        }).catch(e => this.deactiveProgress('fetchCandidatesForCounting'));
    };

    fetchCandidates = () => {
        this.activeProgress('fetchCandidates');
        return this.props.fetchOpenHomeworkCandidates(this.makeCandidatesHomeworkParams())
            .then(r => {
                this.deactiveProgress('fetchCandidates');
                this.setState({
                    totalUnitLimit: r.units.length,
                    candidatesCount: r.units.length,
                });
                return true;
            })
            .catch(e => {
                this.deactiveProgress('fetchCandidates');
                return false;
            });
    };

    checkCandidateCountIsChange = () => {
        if (this.state.totalUnitLimit !== this.state.candidatesCount) {
            return this.fetchCandidates();
        }
        return true;
    };

    selectUnit = async () => {
        let result = await this.checkCandidateCountIsChange();
        if (result)
            this.openModal('selectUnits');
    };

    makeCreateOpenHomeworkParams = (candidates) => {
        return {
            courseId: null,
            title: this.state.title,
            textbookPages: null,
            levels: this.state.selectedLevel.map(l => l.value),
            levelsRatio: [25, 25, 25, 25],
            students: [],
            unitIds: candidates.units.map(unit => unit.contentId),
            leafChapterIds: this.state.selectedChapters.map(sc => sc.contentId),
            countLimitOfEachUnitGroup: 3,
            totalUnitLimit: TOTAL_UNIT_COUNT_LIMIT,
            startDate: this.state.startDate,
            endDate: this.state.endDate,
            wrongUnitsFirst: false,
            expandToChapter: true,
        };
    };

    createOpenHomework = (candidates) => {
        this.activeProgress('createOpenHomework');
        return this.props.createOpenHomework(this.makeCreateOpenHomeworkParams(candidates)).then(r => {
            this.deactiveProgress('createOpenHomework');
            this.init();
            this.setState({homeworkAssign: r.homeworkAssign});
            this.navigateTo(5);
        }).catch(e => {
            this.deactiveProgress('createOpenHomework');
            if (e.response.data && e.response.data.message === 'recommend units is null or size 0') {
                alert("선택한 페이지와 난이도에 해당하는 문항을 출제할 수 없습니다. 페이지를 더 선택하시거나 옵션을 조절해주세요.");
            } else {
                alert("문제지 생성에 실패했습니다!");
            }
        });
    };

    navigateTo = step => {
        this.setState({
            step: step,
        });
    };

    render() {
        const schoolBookOptions = this.getTextbookFilterOption();

        return <div>
            {
                this.props.modal['createOpenHomework'] &&
                <MadModal
                    isOpen={this.props.modal['createOpenHomework']}
                    shouldCloseOnOverlayClick={false}
                    size={'sm'}
                    onRequestClose={this.closeCreateOpenHomework}
                    closeButton={true}>
                    {
                        this.state.step === 1 &&
                        <div>
                            <MadSubTitle>문제지 만들기 - 단원선택</MadSubTitle>
                            <Gap/>
                            <MadLabeled label="과정" labelAlign="left" labelWidth={'30%'}>
                                <MadSelect
                                    className="flex-1"
                                    name="form-field-name"
                                    placeholder={'과정선택 / 검색'}
                                    value={this.state.selectedCourse}
                                    options={Chapters}
                                    searchable={true}
                                    clearable={true}
                                    shouldCloseOnOverlayClick={false}
                                    pageSize={2}
                                    onChange={this.onSelectCourse}
                                    style={{width: '100%'}}
                                />
                            </MadLabeled>
                            <Gap/>
                            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                                <MadButton text="다음"
                                           onClick={() => this.navigateTo(2)}
                                           disabled={!this.props.chapters || !this.state.isTopChapterLoaded || !this.state.selectedCourse}
                                           isLoading={this.state.progress['fetchTopChapters']}/>
                            </div>
                        </div>
                    }
                    {
                        this.state.step === 2 &&
                        <div>
                            <MadSubTitle>문제지 만들기 - 출제 범위 선택</MadSubTitle>
                            <Gap/>
                            {
                                schoolBookOptions &&
                                schoolBookOptions.length > 0 &&
                                <MadLabeled label="교과서 필터" labelAlign="left" labelWidth="30%">
                                    <MadSelect
                                        className="flex-1"
                                        name="form-field-name"
                                        placeholder={'교과서 필터'}
                                        value={this.state.selectedTextbookFilter}
                                        options={this.getTextbookFilterOption()}
                                        searchable={true}
                                        clearable={true}
                                        shouldCloseOnOverlayClick={false}
                                        pageSize={2}
                                        onChange={this.onSelectTextbookFilter}
                                        style={{width: '100%'}}
                                    />
                                </MadLabeled>
                            }
                            <ChapterPicker chapters={this.props.chapters}
                                           selectedChapters={this.state.selectedChapters}
                                           onSelectChapters={selectedChapters => {
                                               this.setState({selectedChapters})
                                           }}
                                           schoolBookFilter={this.state.selectedTextbookFilterValue}
                                           selectLimit={50}
                            />
                            <Gap/>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <MadButton text="이전" onClick={() => this.navigateTo(1)} ghost/>
                                {/*<MadButton text="다음" onClick={() => this.navigateTo(3)} disabled={this.state.selectedChapters.length === 0}/>*/}
                                <MadButton text="다음" onClick={() => {
                                    this.navigateTo(3);
                                }} disabled={this.state.selectedChapters.length === 0}/>
                            </div>
                        </div>
                    }
                    {
                        this.state.step === 3 &&
                        <div>
                            <MadSubTitle>문제지 만들기 - 설정</MadSubTitle>
                            <Gap/>
                            <HomeworkSetting title={this.state.title}
                                             selectedLevel={this.state.selectedLevel}
                                             selectedExpandToChapter={this.state.selectedExpandToChapter}
                                             startDate={this.state.startDate}
                                             endDate={this.state.endDate}
                                             levelOptions={Level}
                                             expandOptions={[ExpandToChapter[0]]}
                                             hideExpandToChapter={true}
                                             updatePropState={this.updateState}
                                             updatePropStates={this.updateStates}
                            />
                            <Gap/>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <MadButton text="이전" onClick={() => this.navigateTo(2)} ghost/>
                                <MadButton text="다음"
                                           onClick={() => this.fetchCandidatesForCounting().then(() => this.navigateTo(4))}
                                           isLoading={this.state.progress['fetchCandidatesForCounting']}
                                           disabled={this.state.selectedLevel.length === 0 || this.state.title.length === 0}/>
                            </div>
                        </div>
                    }
                    {
                        this.state.step === 4 &&
                        <div>
                            <MadSubTitle>문제지 만들기 - 구성</MadSubTitle>
                            <Gap/>
                            <HomeworkStructure title={this.state.title}
                                               startDate={this.state.startDate}
                                               endDate={this.state.endDate}
                                               selectedLevel={this.state.selectedLevel}
                                // candidatesCount={this.state.candidatesCount}
                                               totalUnitLimit={this.state.totalUnitLimit}
                                               maxCandidateCount={this.state.maxCandidateCount}
                                               expandToChapter={this.state.expandToChapter}
                                               students={this.state.students}
                                               selectedTextbookPages={this.state.selectedTextbookPages}
                                               selectedChapters={this.state.selectedChapters}
                                               hideExpandToChapter={true}
                                               hideStudents={true}
                                               updatePropState={this.updateState}/>

                            <Gap/>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <MadButton text="이전" onClick={() => this.navigateTo(3)} ghost/>
                                <MadButton text="문제 선택" onClick={() => this.selectUnit()} disabled={false} isLoading={this.state.progress['fetchCandidates']}/>
                            </div>
                        </div>
                    }
                    {
                        this.state.modal['selectUnits'] &&
                        <MadModal
                            isOpen={this.state.modal['selectUnits']}
                            shouldCloseOnOverlayClick={false}
                            size={'lg'}
                            onRequestClose={() => this.closeModal('selectUnits')}
                            closeButton={true}>
                            <div className="select-unit-modal">
                                <MadSubTitle>문제 선택</MadSubTitle>
                                <Gap sm/>
                                <SelectUnit candidates={this.props.candidates}
                                            createOpenHomework={this.createOpenHomework}
                                            fetchCandidates={this.fetchCandidates}
                                            progress={this.state.progress}
                                />
                            </div>
                        </MadModal>
                    }
                    {
                        this.state.step === 5 &&
                        <div className="homework-create-complete">
                            <MadSubTitle>출제 완료</MadSubTitle>
                            <div className="complete-message">
                                <p>
                                    <i className="mdi mdi-check"/>과제 출제가 완료되었습니다
                                </p>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <MadButton text="공통 문제지 출력" onClick={this.props.openPrint(this.state.homeworkAssign)}/>
                                <Gap h line/>
                                <MadButton text="닫기" ghost onClick={this.closeCreateOpenHomework}/>
                            </div>
                        </div>
                    }
                </MadModal>
            }
        </div>;
    }
};

