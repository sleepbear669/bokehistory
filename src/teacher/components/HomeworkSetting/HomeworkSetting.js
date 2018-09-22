import PropTypes from 'prop-types'
import React, {PureComponent} from 'react'
import './HomeworkSetting.scss';
import {DateRangePicker} from 'react-dates';
import {
    MadLabeled,
    SimpleRowList,
    MadInput,
    MadButtonGroup,
} from "madComponents";

export default class HomeworkSetting extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            hideExpandToChapter: props.hideExpandToChapter || false,
        };
    }

    updateTitle = title => {
        this.props.updatePropState('title', title);
    };

    updateSelectUnitLevel = level => {
        let isLevelExist = this.props.selectedLevel.filter(s => s === level).length === 0;
        let selectedLevel = isLevelExist ? [...this.props.selectedLevel, level] : this.props.selectedLevel.filter(b => b !== level);
        this.props.updatePropState('selectedLevel', selectedLevel);
    };

    selectExpandToChapter = expandToChapter => {
        this.props.updatePropState('selectedExpandToChapter', expandToChapter);
    };

    updateDate = (startDate, endDate) => {
        this.props.updatePropStates({'startDate': startDate, 'endDate': endDate});
    };

    render() {
        const {
            hideExpandToChapter
        } = this.state;
        const {
            title,
            selectedLevel,
            selectedExpandToChapter,
            levelOptions,
            expandOptions,
            startDate,
            endDate,
        } = this.props;

        return <SimpleRowList>
            <MadLabeled label="과제명" labelAlign="left" labelWidth="25%">
                <MadInput text={title}
                          errorMessage={title.length < 2 && title !== "" ? "최소 2자" : ''}
                          placeholder="과제명"
                          width="100%"
                          onChange={e => this.updateTitle(e.target.value)}
                />
            </MadLabeled>
            <MadLabeled label="난이도" labelAlign="left" labelWidth="25%">
                <MadButtonGroup
                    values={selectedLevel}
                    options={levelOptions}
                    clearable={false}
                    multiSelect={true}
                    onChange={this.updateSelectUnitLevel}/>
            </MadLabeled>
            {
                !hideExpandToChapter &&
                <MadLabeled label="출제 범위" labelAlign="left" labelWidth="25%">
                    <MadButtonGroup
                        value={selectedExpandToChapter}
                        options={expandOptions}
                        clearable={false}
                        onChange={this.selectExpandToChapter}/>
                </MadLabeled>
            }
            <MadLabeled label="과제 수행일" labelAlign="left" labelWidth="25%">
                <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onDatesChange={({startDate, endDate}) => this.updateDate(startDate, endDate)}
                    focusedInput={this.state.focusedInput}
                    onFocusChange={focusedInput => this.setState({focusedInput})}
                    keepOpenOnDateSelect={true}
                    numberOfMonths={1}
                />
            </MadLabeled>
        </SimpleRowList>
    }

}


HomeworkSetting.propTypes = {
    title: PropTypes.string,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    selectedLevel: PropTypes.array,
    expandToChapter: PropTypes.bool,
    levelOptions: PropTypes.array,
    expandOptions: PropTypes.array,
    updatePropState: PropTypes.func,
    updatePropStates: PropTypes.func,
};

