import PropTypes from 'prop-types'
import React, {PureComponent} from 'react'
import './SelectUnit.scss';
import {
    MadButton,
    Gap,
} from "madComponents";

export default class SelectUnit extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            trashes: [],
            candidates: this.props.candidates,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            candidates: nextProps.candidates,
            trashes: [],
        })
    }

    fetchCandidates = () => {
        this.props.fetchCandidates();
    };

    createOpenHomework = () => {
        this.props.createOpenHomework(this.state.candidates);
    };

    outOfTheTrash = (ul) => {
        let units = this.state.trashes.filter(unit => unit.contentId !== ul.contentId);
        this.setState({
            trashes: units,
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
            trashes: [
                ...this.state.trashes,
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

    render() {
        const {
            candidates,
            trashes,
        } = this.state;
        return <div className="select-unit">
            <div className="select-unit-header">
                <div className="modal-title-menu">
                    <div className="level level-1">개념 {candidates && candidates.levelCount['-1']}</div>
                    <Gap xs h/>
                    <div className="level level1">기본 {candidates && candidates.levelCount['1']}</div>
                    <Gap xs h/>
                    <div className="level level2">실력 {candidates && candidates.levelCount['2']}</div>
                    <Gap xs h/>
                    <div className="level level3">심화 {candidates && candidates.levelCount['3']}</div>
                    <Gap xs h/>
                    <MadButton className="btn-reload" sm secondary
                               text="다시 불러오기"
                               onClick={() => this.fetchCandidates()}
                               isLoading={this.props.progress['fetchCandidates']}/>
                    <Gap xs h/>
                    <MadButton className="btn-make" sm
                               text="이대로 출제하기"
                               onClick={() => this.createOpenHomework()}
                               disabled={candidates && candidates.units.length === 0}
                               isLoading={this.props.progress['createOpenHomework']}/>
                </div>
            </div>
            <Gap sm/>
            <div className="select-unit-wrapper">
                <div className="unit-wrapper">
                    {
                        candidates && candidates.units.map(candidates => {
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
                        trashes.length !== 0 && trashes.map(trash => {
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
    }

}


SelectUnit.propTypes = {
    candidates: PropTypes.object,
    createOpenHomework: PropTypes.func,
    fetchCandidates: PropTypes.func,
};

