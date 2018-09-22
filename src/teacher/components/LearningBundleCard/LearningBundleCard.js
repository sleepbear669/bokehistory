import React, {PureComponent} from 'react';
import './LearningBundleCard.scss';
import {MadButton, MadSubTitle, Gap, MadDefinitionList, MadBadge} from "madComponents";
import MadDotLabel from "../../../madComponents/MadDotLabel/MadDotLabel";
import MadModal from "../../../madComponents/MadModal/MadModal";
import MadProfile from "../../../madComponents/MadProfile/MadProfile";

export class LearningBundleCard extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isDetailModalOpen: false,
        }
    }

    closeDetailModal = () => {
        this.setState({
            isDetailModalOpen: false
        });
    };

    render() {
        let notAnsweredCount = this.props.learningBundle.summary.totalLearningStudents - this.props.learningBundle.summary.completedLearningStudents;
        let answeredCount = this.props.learningBundle.summary.completedLearningStudents;

        let definitionListValues = [
            {value: this.props.learningBundle.summary.totalLearningStudents, label: '수강학생수', status: 'gray', icon: 'account'},
            {value: notAnsweredCount, label: '채점대기', status: 'danger'},
            {value: answeredCount, label: '채점완료', status: 'success-blue'}
        ];

        let actionButtons = [];
        if (!this.props.learningBundle.completed)
            actionButtons.push(<MadButton ghost fw text="채점" onClick={this.props.openCheck} disabled={this.props.learningBundle.completed}/>);
        if (this.props.learningBundle.completed && this.props.learningBundle.type === 'TEXTBOOK')
            actionButtons.push(<MadButton ghost fw text="오답 클리닉" onClick={this.props.createRecommend} disabled={!this.props.learningBundle.completed}/>);
        if (this.props.learningBundle.type === 'RECOMMEND')
            actionButtons.push(<MadButton ghost fw text="출력" onClick={this.props.openPrint}/>);

        return (
            <div className="card learningbundle-card">
                <div className="card-head">
                    <img src="" className="textbook-logo"/>
                    <div>
                        {
                            this.props.learningBundle.type === 'RECOMMEND' &&
                            <MadBadge>오답 클리닉</MadBadge>
                        }
                        <MadSubTitle text={this.props.learningBundle.textbook.title} className="card-title"/>
                    </div>
                    <div style={{marginTop: 16}}>
                        <span>{this.props.learningBundle.createdDate.year}.{this.props.learningBundle.createdDate.monthValue}.{this.props.learningBundle.createdDate.dayOfMonth}</span>
                        <Gap sm h line/>
                        {
                            this.props.learningBundle.pages &&
                            (
                                this.props.learningBundle.pages.length === 1 ?
                                    this.props.learningBundle.pages[0].pageNumber :
                                    this.props.learningBundle.pages[0].pageNumber + ' ~ ' + this.props.learningBundle.pages[this.props.learningBundle.pages.length - 1].pageNumber
                            )
                        } page
                        {
                            this.props.learningBundle.completed &&
                            [
                                <Gap sm h line/>,
                                <MadDotLabel status="success-blue" text="완료된 학습" colorText bigText/>
                            ]
                        }
                    </div>
                </div>
                <div className="card-body">
                    <Gap xs/>
                    <Gap line/>
                    <MadDefinitionList items={definitionListValues} onClick={() => this.setState({isDetailModalOpen: true})}/>
                    <Gap line/>
                    <div className="is-flex">
                        {actionButtons.joinWithElement(<Gap xs h/>)}
                    </div>
                </div>

                <MadModal
                    isOpen={this.state.isDetailModalOpen}
                    onRequestClose={this.closeDetailModal}
                    closeButton={true}>
                    <MadSubTitle>채점 결과</MadSubTitle>
                    <Gap md/>
                    <table>
                        <tbody>
                        {
                            this.props.learningBundle.learnings.map(learning => {
                                return (
                                    <tr>
                                        <td>
                                            <MadProfile name={learning.student.nickname} size="sm"/>
                                        </td>
                                        <td>
                                            {
                                                learning.learningAnswer &&
                                                <span>{(learning.correctUnitCount / learning.totalUnitCount * 100).toFixed(0)}점</span>
                                            }
                                            {
                                                !learning.learningAnswer &&
                                                <span>미제출</span>
                                            }
                                        </td>
                                        <td>
                                            {
                                                learning.learningAnswer &&
                                                <MadButton text="답안보기" xs/>
                                            }
                                            {
                                                !learning.learningAnswer &&
                                                <MadButton text="채점" xs/>
                                            }
                                        </td>
                                    </tr>)
                            })
                        }
                        {
                            this.props.learningBundle.learnings.length == 0 &&
                            <span>채점 결과가 없습니다</span>
                        }
                        </tbody>
                    </table>
                </MadModal>
            </div>);
    }
}

export default LearningBundleCard
