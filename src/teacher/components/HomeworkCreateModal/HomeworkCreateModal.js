import React, {PureComponent} from 'react';
import './HomeworkCreateModal.scss';
import {
    MadSubTitle,
    MadButton,
    MadButtonGroup,
    MadModal,
    Gap,
    MadInput,
    MadLabeled,
    SimpleRowList,
} from 'madComponents';
import {DateRangePicker} from 'react-dates';
import {cloneDeep} from 'lodash';
import moment from 'moment';
import {Level, TotalUnitLimit, ExpandToChapter} from "../../../shared/homeworkType";
import HomeworkRangePicker from "./HomeworkRangePicker";
import HomeworkGenerationInformation from "./HomeworkGenerationInformation";
import ManageStudentList from '../../components/ManageStudentsList';

const TOTAL_UNIT_COUNT_LIMIT = 50;

export class HomeworkCreateModal extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            selectedButtons: [...Level],
            courseId: '',
            title: '',
            selectedExpandToChapter: ExpandToChapter[1],
            step: 1,
            startDate: moment(new Date()),
            endDate: moment(new Date()).add(7, 'days'),
            createHomeworkFormErrorMessage: {
                title: "최소 2자",
                inputPagesErrorMessage: "잘못된 입력입니다. 예: 1-5,8,11-13"
            },
            createHomeworkForm: {
                courseId: this.props.course && this.props.course.id || '',
                title: this.props.course && new Date().format('yyMMdd') + '_' + this.props.course.title || '',
                textbookPages: [],
                levels: [...Level],
                students: [],
                countLimitOfEachUnitGroup: 3,
                expandToChapter: false,
                totalUnitLimit: TOTAL_UNIT_COUNT_LIMIT,
                startDate: moment(new Date()),
                endDate: moment(new Date()).add(7, 'days'),
            },
            homeworkDetail: this.props.homeworkDetail || null,
            courseStudents: this.props.course && this.props.course.students || '',
            textbookDetail: this.props.textbookDetail || {},
            textbookDetailByChapterName: this.props.textbookDetailByChapterName || {},
            candidates: null,
            trashs: [],
        }
    }

    componentDidMount() {
        this.initCreateHomeworkForm();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            homeworkDetail: nextProps.homeworkDetail || null,
            courseStudents: nextProps.course && nextProps.course.students || '',
            textbookDetail: nextProps.textbookDetail || {},
            textbookDetailByChapterName: nextProps.textbookDetailByChapterName || {},
        });

        if (!this.props.course) {
            this.setState({
                createHomeworkForm: {
                    ...this.state.createHomeworkForm,
                    courseId: nextProps.course && nextProps.course.id || '',
                    title: nextProps.course && new Date().format('yyMMdd') + '_' + nextProps.course.title || '',
                }
            });
        }
    }

    openModalWrapper = (modalName, ...args) => {
        this.props.openModal(modalName, ...args);

        modalName === "createHomework" && this.initCreateHomeworkForm();
    };

    closeModalWrapper = (modalName) => {
        this.props.closeModal(modalName);

        modalName === "selectUnits" && this.setState({trashs: []});
        modalName === "modifyStudent" && this.fetchHomeworks();
        modalName === "createHomework" && this.initCreateHomeworkForm();
    };

    initCreateHomeworkForm = () => {
        this.setState({
            createHomeworkForm: {
                courseId: this.props.course && this.props.course.id || '',
                title: this.props.course && new Date().format('yyMMdd') + '_' + this.props.course.title || '',
                textbookPages: [],
                levels: [...Level],
                students: [],
                countLimitOfEachUnitGroup: 3,
                expandToChapter: false,
                totalUnitLimit: TOTAL_UNIT_COUNT_LIMIT,
                startDate: moment(new Date()),
                endDate: moment(new Date()).add(7, 'days'),
            },
            step: 1,
            selectedButtons: [...Level],
            selectedExpandToChapter: ExpandToChapter[1],
        });
    };

    createHomeworkCourseFilter = student => {
        return !this.state.createHomeworkForm.students.find(s => {
            return s.id === student.id;
        });
    };

    createHomeworkModifyStudent = student => e => {
        let isStudentExist = this.state.createHomeworkForm.students.filter(s => s === student).length === 0;
        this.setState({
            createHomeworkForm: {
                ...this.state.createHomeworkForm,
                students: isStudentExist ? [...this.state.createHomeworkForm.students, student] : this.state.createHomeworkForm.students.filter(s => s !== student),
            }
        });
    };

    updateTotalUnitLimit = currentSelectedValue => {
        this.setState({
            ...this.state,
            createHomeworkForm: {
                ...this.state.createHomeworkForm,
                totalUnitLimit: currentSelectedValue
            }
        });
    };

    createHomeworkUnitLevelSelect = (level) => {
        let isLevelExist = this.state.createHomeworkForm.levels.filter(s => s === level).length === 0;
        this.setState({
            selectedButtons: isLevelExist ? [...this.state.selectedButtons, level] : this.state.selectedButtons.filter(b => b !== level),
            createHomeworkForm: {
                ...this.state.createHomeworkForm,
                levels: isLevelExist ? [...this.state.createHomeworkForm.levels, level] : this.state.createHomeworkForm.levels.filter(s => s !== level),
            },
        });
    };

    checkCandidateCountIsChange = () => {
        if (this.state.createHomeworkForm.totalUnitLimit !== this.state.candidatesCount)
            this.fetchCandidates();
    };

    fetchCandidates = () => {
        this.props.activateProgress('calcCandidate');
        this.props.fetchCandidates(this.makeCandidatesHomeworkParams()).then(r => {
            this.setState({
                candidates: r,
                trashs: []
            });
            this.props.deactivateProgress('calcCandidate');
        })
    };

    makeCandidatesHomeworkParams = () => {
        let params = cloneDeep(this.state.createHomeworkForm);
        params.levels = params.levels.map(l => l.value);
        params.students = params.students.map(s => s.id);
        params.textbookPages = params.textbookPages.map(p => p.id);
        params.leafChapterIds = params.leafChapterIds.map(lp => lp.contentId);

        return params;
    };

    outOfTheTrash = (ul) => {
        let units = this.state.trashs.filter(unit => unit.contentId !== ul.contentId);
        this.setState({
            trashs: units,
            candidates: {
                ...this.state.candidates,
                levelCount: {
                    ...this.state.candidates.levelCount,
                    [ul.level]: this.state.candidates.levelCount[ul.level] ? this.state.candidates.levelCount[ul.level] + 1 : 1
                },
                units: [
                    ...this.state.candidates.units,
                    ul,
                ]
            }
        });
    };

    intoWasteBasket = (ul) => {
        let units = this.state.candidates.units.filter(unit => unit.contentId !== ul.contentId);
        let levelCount = this.setLevelCount(units);
        this.setState({
            candidates: {
                levelCount: levelCount,
                units: units,
            },
            trashs: [
                ...this.state.trashs,
                ul
            ]
        });
    };

    setLevelCount = (lu) => {
        let levelCount = {'-1': 0, '1': 0, '2': 0, '3': 0};
        lu.map(unit => {
            levelCount = {
                ...levelCount,
                [unit.level]: levelCount[unit.level] ? levelCount[unit.level] + 1 : 1,
            }
        });
        return levelCount;
    };

    createHomeworkLearnings(homeworkAssign) {
        homeworkAssign.students.map(student => {
            this.props.createHomeworkLearnings(homeworkAssign.id, student.id).then(r => {
            })
        })
    }

    createHomework() {
        this.props.activateProgress('createHomework');
        this.props.createHomework(this.makeCreateHomeworkParams()).then(r => {
            this.createHomeworkLearnings(r.homeworkAssign);
            this.closeModalWrapper('selectUnits');
            this.props.deactivateProgress('createHomework');
            this.nextStep();
            this.setState({homeworkAssign: r.homeworkAssign});
        }).catch((e) => {
            if (e.response.data && e.response.data.message === 'recommend units is null or size 0') {
                alert("선택한 페이지와 난이도에 해당하는 문항을 출제할 수 없습니다. 페이지를 더 선택하시거나 옵션을 조절해주세요.");
            } else {
                alert("과제 생성에 실패했습니다!");
            }
            this.props.deactivateProgress('createHomework');
        });
    }

    makeCreateHomeworkParams = () => {
        let params = cloneDeep(this.state.createHomeworkForm);
        params.levels = params.levels.map(l => l.value);
        params.students = params.students.map(s => s.id);
        params.textbookPages = params.textbookPages.map(p => p.id);
        params.unitIds = this.state.candidates.units.map(unit => unit.contentId);
        params.leafChapterIds = params.leafChapterIds.map(lp => lp.contentId);
        return params;
    };

    checkParams() {
        const createHomeworkForm = this.state.createHomeworkForm;
        return createHomeworkForm.title !== ""
            && createHomeworkForm.students.length !== 0
            && createHomeworkForm.levels.length !== 0
            // && createHomeworkForm.textbookPages.length !== 0
            && createHomeworkForm.countLimitOfEachUnitGroup !== ""
    }

    selectExpandToChapter = option => {
        this.setState({
            selectedExpandToChapter: option,
            createHomeworkForm: {
                ...this.state.createHomeworkForm,
                expandToChapter: option.value,
            }
        });
    };


    fetchCandidatesForCounting = () => {
        return this.props.fetchCandidates({
            ...this.makeCandidatesHomeworkParams(),
            totalUnitLimit: TOTAL_UNIT_COUNT_LIMIT,
        }).then(r => {
            this.setState({
                ...this.state,
                createHomeworkForm: {
                    ...this.state.createHomeworkForm,
                    totalUnitLimit: r.units.length,
                    candidatesCount: r.units.length,
                },
                candidates: r,
                candidatesCount: r.units.length,
                trashs: []
            });
            return r;
        });
    };

    nextStep(stepName) {
        if (stepName === "fetchCandidates") {
            this.props.activateProgress('calcCandidate');
            this.fetchCandidatesForCounting().then(r => {
                if (r.units.length === 0) {
                    alert("선택 단원에 해당하는 유형의 교재 문제가 없습니다.\n출제범위를 모든 유형으로 선택해 주세요.");
                    this.props.deactivateProgress('calcCandidate');
                    return;
                }
                this.setState({step: this.state.step + 1});
                this.props.deactivateProgress('calcCandidate');
            })
        } else this.setState({step: this.state.step + 1});
    }

    previousStep = () => {
        this.setState({step: this.state.step - 1});
    };

    updateHomeworkRange = (textbookPages, chapters) => {
        this.setState({
            ...this.state,
            createHomeworkForm: {
                ...this.state.createHomeworkForm,
                textbookPages: textbookPages,
                leafChapterIds: chapters,
                expandToChapter: textbookPages.length <= 0
            },
            selectedTextbookPages: textbookPages,
            selectedLeafChapters: chapters,
            selectedExpandToChapter: textbookPages.length > 0 ? ExpandToChapter[1] : ExpandToChapter[0]
        });
        this.nextStep();
    };

    render() {
        return (
            <div>
                <MadModal
                    isOpen={this.props.modal['createHomework']}
                    shouldCloseOnOverlayClick={false}
                    size={'sm'}
                    onRequestClose={() => this.closeModalWrapper('createHomework')}
                    closeButton={true}>
                    {
                        this.state.step === 1 &&
                        <div>
                            <HomeworkRangePicker textbookPages={this.state.createHomeworkForm.textbookPages}
                                                 textbookDetail={this.state.textbookDetail}
                                                 chapters={this.props.chapters}
                                                 updateHomeworkRange={this.updateHomeworkRange}
                            />
                        </div>
                    }
                    {
                        this.state.step === 2 &&
                        <div>
                            <ManageStudentList
                                students={this.state.courseStudents}
                                title="학생 추가"
                                filter={this.createHomeworkCourseFilter}
                                onActionButtonClick={this.createHomeworkModifyStudent}
                                emptyListText="해당하는 학생이 없습니다"
                            />
                            <div className="row">
                                <div className="column is-12">
                                    <div className="column is-flex is-hcentered">
                                        <div className="flex-1" style={{padding: '0 5px', textAlign: 'right'}}>
                                            <MadButton text="이전" ghost onClick={() => this.previousStep()} disabled={false}/>
                                        </div>
                                        <div className="flex-1 left" style={{padding: '0 5px'}}>
                                            <MadButton text="다음" onClick={() => this.nextStep()} disabled={this.state.createHomeworkForm.students.length === 0}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        this.state.step === 3 &&
                        <div>
                            <MadSubTitle>과제 구성</MadSubTitle>
                            <Gap/>
                            <SimpleRowList>
                                <MadLabeled label="과제명" labelAlign="left" labelWidth="25%">
                                    <MadInput text={this.state.createHomeworkForm.title}
                                              errorMessage={this.state.createHomeworkForm.title.length < 2 && this.state.createHomeworkForm.title !== "" ? this.state.createHomeworkFormErrorMessage.title : ''}
                                              placeholder="과제명"
                                              width="100%"
                                              onChange={e => this.setState({
                                                  createHomeworkForm: {
                                                      ...this.state.createHomeworkForm,
                                                      title: e.target.value
                                                  }
                                              })}
                                    />
                                </MadLabeled>
                                <MadLabeled label="난이도" labelAlign="left" labelWidth="25%">
                                    <MadButtonGroup
                                        value={this.state.currentSelected}
                                        values={this.state.selectedButtons}
                                        options={Level}
                                        clearable={false}
                                        multiSelect={true}
                                        onChange={this.createHomeworkUnitLevelSelect}/>
                                </MadLabeled>
                                <MadLabeled label="출제 범위" labelAlign="left" labelWidth="25%">
                                    <MadButtonGroup
                                        value={this.state.selectedExpandToChapter}
                                        options={ExpandToChapter}
                                        clearable={false}
                                        onChange={this.selectExpandToChapter}/>
                                </MadLabeled>
                                <MadLabeled label="과제 수행일" labelAlign="left" labelWidth="25%">
                                    <DateRangePicker
                                        startDate={this.state.startDate} // momentPropTypes.momentObj or null,
                                        endDate={this.state.endDate} // momentPropTypes.momentObj or null,
                                        onDatesChange={({startDate, endDate}) => this.setState({
                                            startDate: startDate,
                                            endDate: endDate,
                                            createHomeworkForm: {
                                                ...this.state.createHomeworkForm,
                                                // startDate: new Date(startDate),
                                                startDate: startDate,
                                                // endDate: new Date(endDate),
                                                endDate: endDate
                                            }
                                        })} // PropTypes.func.isRequired,
                                        focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                                        onFocusChange={focusedInput => this.setState({focusedInput})} // PropTypes.func.isRequired,
                                        keepOpenOnDateSelect={true}
                                        numberOfMonths={1}
                                    />
                                </MadLabeled>
                                <div className="column is-flex is-hcentered">
                                    <div className="flex-1" style={{padding: '0 5px', textAlign: 'right'}}>
                                        <MadButton text="이전" ghost onClick={() => this.previousStep()} disabled={false}/>
                                    </div>
                                    <div className="flex-1 left" style={{padding: '0 5px'}}>
                                        <MadButton text="다음" isLoading={this.props.progress['calcCandidate']} onClick={() => this.nextStep("fetchCandidates")} disabled={!this.checkParams()}/>
                                    </div>
                                </div>
                            </SimpleRowList>
                        </div>
                    }
                    {
                        this.state.step === 4 &&
                        <HomeworkGenerationInformation createHomeworkForm={this.state.createHomeworkForm}
                                                       selectedTextbookPages={this.state.selectedTextbookPages}
                                                       selectedLeafChapters={this.state.selectedLeafChapters}
                                                       previousStep={this.previousStep}
                                                       openModalWrapper={this.openModalWrapper}
                                                       checkCandidateCountIsChange={this.checkCandidateCountIsChange}
                                                       updateTotalUnitLimit={this.updateTotalUnitLimit}
                                                       nextStep={this.nextStep}
                                                       progress={this.props.progress}
                        />
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
                                <MadButton text="출력" onClick={this.props.openPrint(this.state.homeworkAssign)}/>
                                <Gap h line/>
                                <MadButton text="닫기" onClick={e => this.closeModalWrapper('createHomework')} ghost/>
                            </div>
                        </div>
                    }
                </MadModal>

                <MadModal
                    isOpen={this.props.modal['selectUnits']}
                    shouldCloseOnOverlayClick={false}
                    size={'lg'}
                    onRequestClose={() => this.closeModalWrapper('selectUnits')}
                    closeButton={true}>
                    <div className="select-unit-modal">
                        <MadSubTitle>문제 선택</MadSubTitle>
                        <Gap sm/>
                        <div className="select-unit-modal-header">
                            <div className="modal-title-menu">
                                <div className="level level-1">개념 {this.state.candidates && this.state.candidates.levelCount['-1']}</div>
                                <Gap xs h/>
                                <div className="level level1">기본 {this.state.candidates && this.state.candidates.levelCount['1']}</div>
                                <Gap xs h/>
                                <div className="level level2">실력 {this.state.candidates && this.state.candidates.levelCount['2']}</div>
                                <Gap xs h/>
                                <div className="level level3">심화 {this.state.candidates && this.state.candidates.levelCount['3']}</div>
                                <Gap xs h/>
                                <MadButton className="btn-reload" sm text="다시 불러오기" secondary onClick={() => this.fetchCandidates()}/>
                                <Gap xs h/>
                                <MadButton className="btn-make" sm text="이대로 출제하기" onClick={() => this.createHomework()} disabled={this.state.candidates && this.state.candidates.units.length === 0}/>
                            </div>
                        </div>
                        <Gap sm/>
                        <div className="select-unit-wrapper">
                            <div className="unit-wrapper">
                                {
                                    this.state.candidates && this.state.candidates.units.map(candidates => {
                                        return (
                                            <div key={candidates.id} className={`unit level${candidates.level}`}>
                                                <img src={candidates.candidatesImageUrl}/>
                                                <MadButton className="btn-trash" icon="delete" sm square ghost2 onClick={() => this.intoWasteBasket(candidates)}/>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div className="trash-wrapper">
                                <h3>휴지통</h3>
                                {
                                    this.state.trashs.length !== 0 && this.state.trashs.map(trash => {
                                        return (
                                            <div key={trash.contentId} className={`unit level${trash.level}`}>
                                                <img src={trash.candidatesImageUrl}/>
                                                <MadButton className="btn-redo" icon="undo-variant" xs square ghost2 onClick={() => this.outOfTheTrash(trash)}/>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </MadModal>
            </div>
        )
    }
}

export default HomeworkCreateModal
