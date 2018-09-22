import React, {PureComponent} from 'react';
import {Link} from 'react-router-dom';
import './StudentList.scss';
import {MadButton, MadTag} from "madComponents";

export default class StudentList extends PureComponent {
    getStudentStat = (learningType, summary) => {
        if (learningType === 'textbook') {
            let acc = Math.floor(summary.textbookLearningSummary.correctCount / summary.textbookLearningSummary.totalCount * 100);
            let pageNumber = summary.textbookLearningSummary.lastLearnPageNumber;
            if (pageNumber) return <MadTag outline color="black">{`${pageNumber}p, ${acc}%`}</MadTag>;
            else return null;
        } else if (learningType === 'recommend') {
            let acc = Math.floor(summary.recommendLearningSummary.correctCount / summary.recommendLearningSummary.totalCount * 100);
            if (isNaN(acc)) return null;
            return <MadTag outline color="black">{`정답률: ${acc}%`}</MadTag>;
        }
    };

    render() {
        let {students, courseId, currentStudent, learningType, summariesByStudentId} = this.props;

        return (
            <div className={this.props.className}>
                <div className="row is-gapless is-vcentered bottom-line simple-list-header padding-cell space-between">
                    <div>
                        수강학생
                        &nbsp;
                        <Link to={`/teacher/courses/${courseId}/students/add`}>
                            <MadButton text="학생추가" xs ghost/>
                        </Link>
                    </div>
                    {
                        summariesByStudentId && learningType === 'textbook' &&
                        <MadTag outline color="black">진도, 정답률</MadTag>
                    }
                    {
                        summariesByStudentId && learningType === 'recommend' &&
                        <MadTag outline color="black">정답률</MadTag>
                    }
                </div>
                <div style={{
                    overflow: 'scroll',
                    overflowX: 'visible',
                    height: `calc(100vh - ${256 + 56 + 16}px)`
                }}>
                    {
                        students &&
                        students.map((student, i) => {
                            if (this.props.onSelectStudent)
                                return (
                                    <div className="is-vcentered bottom-line-light simple-list-item padding-cell space-between"
                                         style={{'background': currentStudent === student ? '#f5f5f5' : '', cursor: 'pointer'}}
                                         key={i}
                                         onClick={e => this.props.onSelectStudent(student)}>
                                        <span>{student.nickname}</span>
                                    </div>
                                );
                            return (
                                <Link className="bottom-line-light student-list-item padding-cell"
                                      key={i}
                                      to={`/teacher/courses/${courseId}/students/${student.id}/${learningType}`}
                                      style={{'background': currentStudent === student ? '#f5f5f5' : '', cursor: 'pointer'}}
                                      onClick={() => this.props.loadingInProgress('learningPageLoading')}>
                                    <div className="is-vcentered space-between">
                                        <span>{student.nickname}</span>
                                        {
                                            summariesByStudentId && summariesByStudentId[student.id] &&
                                            this.getStudentStat(learningType, summariesByStudentId[student.id])
                                        }
                                    </div>
                                    {
                                        summariesByStudentId && summariesByStudentId[student.id] && learningType === 'textbook' &&
                                        <LearningGraph data={summariesByStudentId[student.id].textbookLearningSummary.accuraciesByPages}/>
                                    }
                                    {
                                        summariesByStudentId && summariesByStudentId[student.id] && learningType === 'recommend' &&
                                        <LearningGraph data={summariesByStudentId[student.id].recommendLearningSummary.accuracies}/>
                                    }
                                </Link>
                            )
                        })
                    }
                </div>
            </div>
        );
    }
}

class LearningGraph extends PureComponent {
    static colors = [
        '#eee',
        '#D14355',
        '#F28D66',
        '#9CdE97',
        '#3D8BB9',
    ]; // https://codepen.io/njmcode/pen/axoyD
    static boxSizeW = 5;
    static boxSizeH = 5;
    static margin = 1;

    getColor = value => {
        if (value === -1) return LearningGraph.colors[0];
        return LearningGraph.colors[1 + Math.floor((LearningGraph.colors.length - 2) * value / 100)];
    };

    render() {
        let {data} = this.props;

        if (data && data.length > 0) {
            let boxSizeW = LearningGraph.boxSizeW;
            let gapSize = boxSizeW + LearningGraph.margin;
            let columnCount = Math.ceil(258 / gapSize);
            let rowCount = Math.ceil(data.length / columnCount);
            columnCount = Math.ceil(data.length / rowCount);

            return <svg width={gapSize * columnCount + 4} height={(LearningGraph.boxSizeH + LearningGraph.margin) * rowCount + 4} className="heatmap-svg">
                {
                    data.groupSize(rowCount).map((da, i) =>
                        <g transform={`translate(${gapSize * i + 2},2)`} key={i}>
                            {
                                da.map((d, i) => <rect className="day" width={boxSizeW} height={LearningGraph.boxSizeH} x="0" y={gapSize * i} fill={this.getColor(d)}/>)
                            }
                        </g>
                    )
                }
            </svg>
        }
        return null;
    }
}
