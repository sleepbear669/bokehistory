import PropTypes from 'prop-types'
import React, {PureComponent} from 'react'
import './HomeworkStructure.scss';
import {
    MadBadge,
    MadSlider,
    MadPanel,
    MadPanelNav,
    MadPanelContents,
    MadLocalDateFormat,
} from "madComponents";

export default class HomeworkStructure extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            hideExpandToChapter: props.hideExpandToChapter || false,
            hideStudents: props.hideStudents || false,
        };
    }

    updateTotalUnitLimit = selected => {
        this.props.updatePropState('totalUnitLimit', selected.value);
    };

    render() {
        const {
            hideExpandToChapter,
            hideStudents
        } = this.state;
        const {
            title,
            startDate,
            endDate,
            selectedLevel,
            totalUnitLimit,
            maxCandidateCount,
            expandToChapter,
            students,
            selectedTextbookPages,
            selectedChapters,
        } = this.props;
        return <div className="homework-structure-list">
            <div className="item-wrapper top">
                <div className="item-title item">과제명</div>
                <div className="item-description item">{title}</div>
            </div>
            <div className="item-wrapper">
                <div className="item-title item">과제 진행일</div>
                <div className="item-description item">
                    <MadLocalDateFormat
                        startLocalDate={startDate}
                        endLocalDate={endDate}/>
                </div>
            </div>
            <div className="item-wrapper">
                <div className="item-title item">난이도</div>
                <div className="item-description item">
                    {
                        selectedLevel.sort((a, b) => a.value - b.value).map((l, i) => {
                            return <MadBadge key={`level-btn-${i}`}>{l.label}</MadBadge>
                        })
                    }
                </div>
            </div>
            <div className="item-wrapper">
                <div className="item-title item">최대 문항수</div>
                <div className="item-description item">
                    {
                        <MadSlider editable={true}
                                   min={5}
                                   max={maxCandidateCount}
                                   defaultValue={totalUnitLimit}
                                   style={{width: '250px'}}
                                   onChange={e => this.updateTotalUnitLimit({value: e})} unit="개"/>
                    }
                </div>
            </div>
            {
                !hideExpandToChapter &&
                <div className="item-wrapper">
                    <div className="item-title item">출제 범위</div>
                    <div className="item-description item">
                        {
                            expandToChapter ? "모든 유형에서" : "교재 유형에서만"
                        }
                    </div>
                </div>
            }
            {
                !hideStudents &&
                <div className="item-wrapper">
                    <div className="item-title item">참여 학생</div>
                    <div className="item-description item">
                        {
                            students.length === 0 &&
                            "참여 학생이 없습니다."
                        }
                        {
                            students.length > 0 &&
                            <MadPanel align="right" deactivate={students.length <= 1}>
                                <MadPanelNav>
                                    {students[0].nickname} 외 {students.length - 1}명
                                </MadPanelNav>
                                <MadPanelContents style={{padding: '6px 0'}}>
                                    {
                                        students.map(s => <div key={`s-${s.id}`}>{s.nickname}</div>)
                                    }
                                </MadPanelContents>
                            </MadPanel>
                        }
                    </div>
                </div>
            }
            {
                selectedTextbookPages.length > 0 &&
                <div className="item-wrapper">
                    <div className="item-title item">선택된 페이지</div>
                    <div className="item-description item">
                        <MadPanel align="right" deactivate={selectedTextbookPages.length <= 1}>
                            <MadPanelNav>
                                p.{selectedTextbookPages[0].pageNumber}외 {selectedTextbookPages.length - 1}페이지
                            </MadPanelNav>
                            <MadPanelContents style={{padding: '6px 0'}}>
                                {
                                    selectedTextbookPages.sort((a, b) => a.id - b.id).map(t => <div key={`createHomeworkTextbookPages-${t.id}`}>{`p.${t.pageNumber}`}</div>)
                                }
                            </MadPanelContents>
                        </MadPanel>
                    </div>
                </div>
            }
            {
                selectedChapters.length > 0 &&
                <div className="item-wrapper">
                    <div className="item-title item">선택된 단원</div>
                    <div className="item-description item">
                        <MadPanel align="right" deactivate={selectedChapters.length <= 1}>
                            <MadPanelNav>
                                {selectedChapters[0].name} 외 {selectedChapters.length - 1}개 단원
                            </MadPanelNav>
                            <MadPanelContents style={{padding: '6px 0', textAlign: 'left'}}>
                                {
                                    selectedChapters.map(c => <div key={c.id} style={{margin: 2}}>{c.name}</div>)
                                }
                            </MadPanelContents>
                        </MadPanel>
                    </div>
                </div>
            }
        </div>
    }

}


HomeworkStructure.propTypes = {
    title: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    selectedLevel: PropTypes.array,
    candidatesCount: PropTypes.number,
    totalUnitLimit: PropTypes.number,
    expandToChapter: PropTypes.bool,
    students: PropTypes.array,
    selectedTextbookPages: PropTypes.array,
    selectedChapters: PropTypes.array,
    updatePropState: PropTypes.func,
    hideExpandToChapter: PropTypes.bool,
    hideStudents: PropTypes.bool,
};

