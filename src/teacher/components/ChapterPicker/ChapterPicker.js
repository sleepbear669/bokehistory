import PropTypes from 'prop-types'
import React, {PureComponent} from 'react'
import './ChapterPicker.scss';
import {MadCheckbox} from "madComponents";

export default class ChapterPicker extends PureComponent {
    toggleSelectAll = chapters => e => {
        const {selectedChapters, onSelectChapters} = this.props;
        let list = [...selectedChapters];

        let isEveryChecked = this._isEverySelected(chapters);
        if (isEveryChecked) list = list.filter(chapter => !chapters.find(c => c === chapter));
        else list.push(...chapters);

        list = list.filter(l => !this.isDisabledChapter(l.contentId)).distinctBy(l=> l.contentId);

        onSelectChapters && onSelectChapters(list);
    };

    toggleSelect = chapter => e => {
        const {selectedChapters, onSelectChapters} = this.props;
        let list = [...selectedChapters];

        let alreadyExistChapter = selectedChapters.find(c => c === chapter);
        if (alreadyExistChapter) list = list.filter(c => c !== alreadyExistChapter);
        else list.push(chapter);

        onSelectChapters && onSelectChapters(list);
    };

    isDisabledChapter = contentId => this.props.schoolBookFilter && !this.props.schoolBookFilter.includes(contentId);

    _isEverySelected = (chapters) => chapters.filter(l => !this.isDisabledChapter(l.contentId)).every(this._isSelectedChapter);

    _isSelectedChapter = chapter => this.props.selectedChapters.find(c => c === chapter);

    render() {
        const {
            chapters,
            selectedChapters,
        } = this.props;

        return <div className="textbook-chapter-picker">
            {
                chapters &&
                chapters.map(chapter => {
                    return <div key={`tc-${chapter.topChapter.id}`}>
                        <h3>
                            <MadCheckbox text={chapter.topChapter.name} onChange={this.toggleSelectAll(chapter.leafChapters)} checked={this._isEverySelected(chapter.leafChapters)}/>
                        </h3>
                        <ul style={{listStyle: 'none'}}>
                            {
                                chapter.leafChapters.map(leafChapter =>
                                    <li key={`lc-${leafChapter.id}`}>
                                        <MadCheckbox key={`lc-${leafChapter.id}-checkbox`}
                                                     text={leafChapter.name}
                                                     checked={selectedChapters.includes(leafChapter)}
                                                     onChange={this.toggleSelect(leafChapter)}
                                                     disabled={this.isDisabledChapter(leafChapter.contentId)}
                                        />
                                    </li>
                                )
                            }
                        </ul>
                    </div>
                })
            }
        </div>
    }
}

ChapterPicker.propTypes = {
    chapters: PropTypes.array,
    selectedChapters: PropTypes.array,
    selectLimit: PropTypes.number,
    onSelectChapters: PropTypes.func,
    schoolBookFilter: PropTypes.array
};

