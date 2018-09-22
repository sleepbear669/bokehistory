import React, {PureComponent} from 'react';
import {
    MadSubTitle,
    MadButton,
    Gap,
    MadInput,
    MadLabeled,
    MadTab,
    MadTabNav,
    MadTabNavItem,
    MadTabContents,
    MadCheckbox,
    MadPanel,
    MadPanelNav,
    MadPanelContents,
    MadSlider
} from 'madComponents';
import moment from 'moment';

const PICKER_TYPE = {NONE: 'NONE', PAGE: 'PAGE', CHAPTER: 'CHAPTER'}
export default class HomeworkGenerationInformation extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            pickerType: props.createHomeworkForm.textbookPages.length > 0 ? PICKER_TYPE.PAGE : PICKER_TYPE.CHAPTER
        }
    }

    componentDidMount() {
    }

    getDateRange() {
        const {createHomeworkForm} = this.props;
        return moment(createHomeworkForm.startDate).format("YYYY.MM.DD") + "~" + moment(createHomeworkForm.endDate).format("YYYY.MM.DD");
    }

    getStudent() {
        const {createHomeworkForm} = this.props;
        return <MadPanel align="right" deactivate={createHomeworkForm.students.length <= 1}>
            <MadPanelNav>
                {createHomeworkForm.students[0].nickname} 외 {createHomeworkForm.students.length - 1}명
            </MadPanelNav>
            <MadPanelContents style={{padding: '6px 0'}}>
                {
                    createHomeworkForm.students.map(s => <div key={`s-${s.id}`}>{s.nickname}</div>)
                }
            </MadPanelContents>
        </MadPanel>
    }

    updateTotalUnitLimit = currentSelected => {
        this.props.updateTotalUnitLimit(currentSelected.value);
    };

    getCandidatesCount() {
        const {createHomeworkForm} = this.props;
        return <MadSlider editable={true}
                          min={5}
                          max={createHomeworkForm.candidatesCount}
                          defaultValue={createHomeworkForm.totalUnitLimit}
                          onChange={e => this.updateTotalUnitLimit({value: e})} unit="개"/>
    }

    getLevels() {
        return this.props.createHomeworkForm.levels.map((l, i) => {
            return (<span key={`createHomeworkLevel-${i}`}><Gap h xs/><MadButton ghost xs text={l.label} style={{cursor: 'default'}}/></span>)
        })
    }

    getPages() {
        const {selectedTextbookPages} = this.props;
        return <MadPanel align="right" deactivate={selectedTextbookPages.length <= 1}>
            <MadPanelNav>
                p.{selectedTextbookPages[0].pageNumber}외 {selectedTextbookPages.length - 1}페이지
            </MadPanelNav>
            <MadPanelContents style={{padding: '6px 0'}}>
                {
                    selectedTextbookPages.map(t => <div key={`createHomeworkTextbookPages-${t.id}`}>{`p.${t.pageNumber}`}</div>)
                }
            </MadPanelContents>
        </MadPanel>
    }

    getChapters() {
        const {selectedLeafChapters} = this.props;
        return <MadPanel align="right" deactivate={selectedLeafChapters.length <= 1}>
            <MadPanelNav>
                {selectedLeafChapters[0].name} 외 {selectedLeafChapters.length - 1}개 단원
            </MadPanelNav>
            <MadPanelContents style={{padding: '6px 0'}}>
                {
                    selectedLeafChapters.map(c => <div key={c.id}>{c.name}</div>)
                }
            </MadPanelContents>
        </MadPanel>
    }

    complete = () => {
        this.props.checkCandidateCountIsChange();
        this.props.openModalWrapper('selectUnits');
    };

    render() {
        const {
            createHomeworkForm
        } = this.props;
        return (
            <div>
                <MadSubTitle>과제 만들기</MadSubTitle>
                <Gap/>
                <HomeworkGenerationInformationItem title="과제명" description={createHomeworkForm.title} styles={{borderTop: '1px solid black'}}/>
                <HomeworkGenerationInformationItem title="과제 진행일" description={this.getDateRange()}/>
                <HomeworkGenerationInformationItem title="난이도" description={this.getLevels()}/>
                <HomeworkGenerationInformationItem title="최대 문항수" description={this.getCandidatesCount()}/>
                <HomeworkGenerationInformationItem title="출제 범위" description={createHomeworkForm.expandToChapter ? "모든 유형에서" : "교재 유형에서만"}/>
                <HomeworkGenerationInformationItem title="참여 학생" description={this.getStudent()}/>
                {
                    this.state.pickerType === PICKER_TYPE.PAGE &&
                    <HomeworkGenerationInformationItem title="선택된 페이지" description={this.getPages()}/>
                }
                {
                    this.state.pickerType === PICKER_TYPE.CHAPTER &&
                    <HomeworkGenerationInformationItem title="선택된 단원" description={this.getChapters()}/>
                }
                <div className="row">
                    <div className="column is-12">
                        <div className="column is-flex is-hcentered">
                            <div className="flex-1" style={{padding: '0 5px', textAlign: 'right'}}>
                                <MadButton text="이전" ghost onClick={() => this.props.previousStep()} disabled={false}/>
                            </div>
                            <div className="flex-1 left" style={{padding: '0 5px'}}>
                                <MadButton text="문제선택" isLoading={this.props.progress['createHomework']}
                                           onClick={() => this.complete()}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class HomeworkGenerationInformationItem extends PureComponent {
    render() {
        const {title, description, styles} = this.props;
        return <div className="row is-gapless is-vcentered bottom-line-light simple-list-item"
                    style={styles}>
            <div className="column is-3 padding-cell" style={{textAlign: 'left'}}>
                {title}
            </div>
            <div className="column is-9 padding-cell" style={{textAlign: 'right'}}>
                {description}
            </div>
        </div>
    }
}
