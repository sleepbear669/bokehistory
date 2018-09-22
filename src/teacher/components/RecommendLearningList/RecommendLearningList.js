import React, {PureComponent} from 'react';
import './RecommendLearningList.scss';
import {
    MadButton,
    MadLoadingView,
    MadLocalDateFormat
} from "madComponents";

export default class RecommendLearningList extends PureComponent {
    constructor(props) {
        super(props);
    }

    createCorrectCountView(learning) {
        if (learning && learning.complete) return <MadButton sm fixedSize secondary onClick={() => this.props.onClickLearning(learning)}>{learning.totalUnitCount}/{learning.correctUnitCount}/{learning.wrongUnitCount}</MadButton>;
        else return <MadButton sm fixedSize ghost onClick={() => this.props.onClickLearning(learning)}>채점</MadButton>;
    }

    render() {
        return (
            <div className={this.props.className}>
                <div className="row is-gapless is-vcentered bottom-line bottom-line simple-list-header">
                    <div className="column is-2 padding-cell" style={{textAlign: 'left'}}>학습번호</div>
                    <div className="column is-2 padding-cell" style={{textAlign: 'left'}}>만든날짜</div>
                    <div className="column is-2 padding-cell" style={{textAlign: 'left'}}>페이지</div>
                    <div className="column is-3 padding-cell" style={{textAlign: 'center'}}>채점<br/>(총문항/정답/오답)</div>
                    <div className="column is-3 padding-cell" style={{textAlign: 'center'}}>출력</div>
                </div>
                <div style={{
                    overflow: 'scroll',
                    overflowX: 'visible',
                    height: `calc(100vh - ${256 + 56 + 16}px)`
                }}>
                    {
                        this.props.learnings &&
                        this.props.learnings.map((learning, i) => {
                            return (
                                <div key={i} className="row is-gapless is-vcentered bottom-line-light simple-list-item"
                                     style={{'background': this.props.currentLearning && this.props.currentLearning.id === learning.id ? '#f5f5f5' : ''}}>
                                    <div className="column is-2 padding-cell">{learning.id}</div>
                                    <div className="column is-2 padding-cell"><MadLocalDateFormat range={false} localDate={learning.createdDate}/></div>
                                    <div className="column is-2 padding-cell">
                                        {learning.page}페이지
                                        {
                                            learning.pageIds && learning.pageIds.length > 1 &&
                                            <small className="small-text">{` 외 ${learning.pageIds.length - 1}개 페이지`}</small>
                                        }
                                    </div>
                                    <div className="column is-3 padding-cell" style={{textAlign: 'center'}}>
                                        {
                                            this.createCorrectCountView(learning)
                                        }
                                    </div>
                                    <div className="column is-3 padding-cell" style={{textAlign: 'center'}}>
                                        {
                                            <MadButton text="출력" fixedSize sm ghost onClick={this.props.openPrint(learning)}/>
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                    {
                        !this.props.learnings &&
                        <MadLoadingView showText={true}/>
                    }
                    {
                        this.props.learnings && this.props.learnings.length === 0 &&
                        <p>학습이 없습니다</p>
                    }
                </div>
            </div>
        );
    }
}
