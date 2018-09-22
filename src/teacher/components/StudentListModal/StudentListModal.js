import React, {Component} from 'react';
import PropTypes from 'prop-types'

import {GradeType, GradeTypeShort, Grade} from "../../../shared/gradeType";
import './StudentListModal.scss';

import {
    MadButton,
    MadModal,
    Gap,
    MadSubTitle,
    MadInput,
    MadSelect,
} from "madComponents";

export default class StudentListModal extends Component {

    constructor(props) {
        super(props);

        this.state = {
            selectedGradeFilter: null,
            studentSearchQuery: '',
        };
    }

    onSelectGradeFilter = grade => {
        this.setState({
            selectedGradeFilter: grade
        })
    };

    gradeFilter = student => {
        if (this.state.selectedGradeFilter)
            return student.grade === this.state.selectedGradeFilter.value;
        return true;
    };

    searchByText = student => {
        if (this.state.studentSearchQuery.length === 0) return true;

        const grade = GradeType[student.grade] + GradeTypeShort[student.grade];
        const name = student.nickname;
        const searchWords = this.state.studentSearchQuery.split(' ');

        if (searchWords.length === 1)
            return grade.includes(searchWords[0]) || name.includes(searchWords[0]);
        else
            return grade.includes(searchWords[0]) && name.includes(searchWords[1]);
    };

    render() {
        let propsFilter = this.props.filter ? this.props.filter : () => true;
        let filteredResult = this.props.students
            .filter(this.gradeFilter)
            .filter(this.searchByText);

        return (
            <MadModal
                isOpen={this.props.isOpen}
                size={'sm'}
                onRequestClose={this.props.onRequestClose}
                closeButton={true}>
                <MadSubTitle key="studentModal-title">{this.props.title || '학생목록'}</MadSubTitle>
                <Gap/>
                <div className="row">
                    <div className="column is-4">
                        <MadSelect key="studentModal-select"
                                   className="flex-1"
                                   name="form-field-name"
                                   placeholder={'학년'}
                                   value={this.state.selectedGradeFilter}
                                   options={Grade}
                                   searchable={true}
                                   clearable={true}
                                   pageSize={2}
                                   onChange={this.onSelectGradeFilter}
                                   style={{width: '100%'}}
                        />
                    </div>
                    <div className="column is-8 is-flex">
                        <MadInput icon="magnify" placeholder="검색" type="search" className="flex-1"
                                  text={this.state.studentSearchQuery}
                                  onChange={e => this.setState({
                                      studentSearchQuery: e.target.value
                                  })}/>
                    </div>
                </div>
                <div style={{height: 'calc(80vh - 210px)', overflow: 'scroll', overflowX: 'visible',}}>
                    <table>
                        <tbody>
                        {
                            filteredResult
                                .map((student, i) => (
                                    <tr key={i}>
                                        <td>
                                            {GradeType[student.grade]}
                                        </td>
                                        <td style={{textAlign: 'left'}}>
                                            {student.nickname}
                                        </td>
                                        <td style={{textAlign: 'right'}}>
                                            {
                                                propsFilter(student) ?
                                                    <MadButton text={this.props.actionButtonText || '추가'} xs isLoading={this.props.progress[`modifyStudent-id${student.id}`]} fixedSize onClick={this.props.onActionButtonClick(student)}/> :
                                                    <MadButton text={this.props.doneButtonText || '추가됨'} xs fixedSize ghost/>
                                            }
                                        </td>
                                    </tr>
                                ))
                        }
                        {
                            filteredResult.length === 0 &&
                            <tr style={{textAlign: 'center'}}>
                                <td colSpan="3">{this.props.emptyListText}</td>
                            </tr>
                        }
                        </tbody>
                    </table>
                </div>
            </MadModal>
        )
    }
}

StudentListModal.propTypes = {
    title: PropTypes.string,
    isOpen: PropTypes.bool,
    students: PropTypes.array,
    actionButtonText: PropTypes.string,
    onActionButtonClick: PropTypes.func,
    onRequestClose: PropTypes.func,
    filter: PropTypes.func,
    emptyListText: PropTypes.string,
    progress: PropTypes.object,
};
