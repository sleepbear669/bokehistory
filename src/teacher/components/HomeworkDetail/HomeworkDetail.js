import PropTypes from 'prop-types'
import React, {PureComponent} from 'react'
import './HomeworkDetail.scss';
import {
    MadButton,
    MadPanel,
    MadPanelNav,
    MadPanelContents,
    MadLocalDateFormat,
} from "madComponents";

export default class HomeworkDetail extends PureComponent {
    constructor(props) {
        super(props);
    }

    getChapterNames = () => {
        let leafChapters = [];
        if (this.props.leafChapters) {
            this.props.leafChapters.forEach(lc => {
                if (this.props.homework.leafChapterIds.includes(lc.contentId))
                    leafChapters.push(lc);
            });
        }

        return leafChapters;
    };

    openModifyStudent = () => {
        this.props.openModifyStudent();
    };

    render() {
        const {
            homework,
        } = this.props;
        return <div>
            {
                homework &&
                <div className="homework-detail-list">
                    <div className="item-wrapper top">
                        <div className="item item-title">
                            과제명
                        </div>
                        <div className="item item-description">
                            {homework.title}
                        </div>
                    </div>
                    <div className="item-wrapper">
                        <div className="item item-title">
                            과제 진행일
                        </div>
                        <div className="item item-description">
                            <MadLocalDateFormat
                                range={true}
                                startLocalDate={homework.startDate}
                                endLocalDate={homework.endDate}
                                format={'YYYY.MM.DD'}/>
                        </div>
                    </div>
                    <div className="item-wrapper">
                        <div className="item item-title">
                            문항수
                        </div>
                        <div className="item item-description">
                            {homework.totalUnitCount}개
                        </div>
                    </div>
                    <div className="item-wrapper">
                        <div className="item item-title">
                            참여 학생
                        </div>
                        <div className="item item-description">
                            {
                                homework.students.length > 0 &&
                                <MadPanel align={'right'} deactivate={homework.students.length <= 1}>
                                    <MadPanelNav>
                                        {homework.students[0].nickname} 외 {homework.students.length - 1}명
                                    </MadPanelNav>
                                    <MadPanelContents style={{padding: '6px 0'}}>
                                        {
                                            homework.students.map(s => <div key={`s-${s.id}`}>{s.nickname}</div>)
                                        }
                                    </MadPanelContents>
                                </MadPanel>
                            }
                            {
                                homework.students.length === 0 &&
                                <span className="font-color-text-light">학생이 없습니다</span>
                            }
                            <MadButton text="참여학생 변경" ghost xs onClick={() => this.openModifyStudent()}/>
                        </div>
                    </div>
                    {
                        homework.textbookPages && homework.textbookPages.length > 0 &&
                        <div className="item-wrapper">
                            <div className="item item-title">
                                선택된 페이지
                            </div>
                            <div className="item item-description">
                                <MadPanel align={'right'} deactivate={homework.textbookPages.length <= 1}>
                                    <MadPanelNav>
                                        p.{homework.textbookPages[0].pageNumber} 외 {homework.textbookPages.length - 1}페이지
                                    </MadPanelNav>
                                    <MadPanelContents style={{padding: '6px 0'}}>
                                        {
                                            homework.textbookPages.map(t => <div key={`tp-${t.id}`}>{'p.' + t.pageNumber}</div>)
                                        }
                                    </MadPanelContents>
                                </MadPanel>
                            </div>
                        </div>
                    }
                    {
                        homework.leafChapterIds && homework.leafChapterIds.length > 0 && this.props.leafChapters &&
                        <div className="item-wrapper">
                            <div className="item item-title">
                                선택된 단원
                            </div>
                            <div className="item item-description">
                                <MadPanel align={'right'} deactivate={homework.leafChapterIds.length <= 1}>
                                    <MadPanelNav>
                                        {
                                            this.getChapterNames()[0] &&
                                            this.getChapterNames()[0].name
                                        }
                                    </MadPanelNav>
                                    <MadPanelContents style={{padding: '6px 0', textAlign: 'left'}}>
                                        {
                                            this.getChapterNames().map(t => <div key={`tp-${t.id}`} style={{margin: 2}}>{t.name}</div>)
                                        }
                                    </MadPanelContents>
                                </MadPanel>
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    }

}


HomeworkDetail.propTypes = {
    homework: PropTypes.object,
    chapters: PropTypes.object,
    modifyStudent: PropTypes.func
};

