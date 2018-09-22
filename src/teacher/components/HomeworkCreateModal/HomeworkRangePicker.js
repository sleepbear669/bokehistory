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
} from 'madComponents';
import ChapterPicker from "../ChapterPicker";

const PICKER_TYPE = {NONE: 'NONE', PAGE: 'PAGE', CHAPTER: 'CHAPTER'};

export default class HomeworkRangePicker extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            pickerType: PICKER_TYPE.NONE,
            textbookPages: [],
            chapters: []
        }
    }

    componentDidMount() {
    }

    setPickerType = type => {
        this.setState({
            pickerType: type,
            textbookPages: [],
            chapters: []
        })
    };


    setTextbookPages = pages => {
        this.setState({
            ...this.state,
            textbookPages: pages,
        });
    };

    setChapters = chapters => {
        this.setState({
            ...this.state,
            chapters: chapters,
        });
    };

    updateHomeworkRange = () => {
        this.props.updateHomeworkRange(this.state.textbookPages, this.state.chapters);
    };

    render() {
        const {
            pickerType,
            textbookPages,
            chapters
        } = this.state;
        return (
            <div>
                <div className="row">
                    <div className="column is-6">
                        <MadSubTitle>출제 범위 선택</MadSubTitle>
                    </div>
                </div>
                <div className="row">
                    <div className="column is-12">
                        {
                            pickerType === PICKER_TYPE.NONE &&
                            <div>
                                <Gap v sm/>
                                <div style={{display: 'flex'}}>
                                    <div className="flex-1 homework-range-picker-btn" onClick={() => this.setPickerType(PICKER_TYPE.PAGE)}>
                                        <div>페이지</div>
                                    </div>
                                    <Gap h sm/>
                                    <div className="flex-1 homework-range-picker-btn" onClick={() => this.setPickerType(PICKER_TYPE.CHAPTER)}>
                                        <span>단원</span>
                                    </div>
                                </div>
                                <Gap v sm/>
                            </div>
                        }
                        {
                            pickerType === PICKER_TYPE.PAGE &&
                            <MadTab key={`page-picker`}>
                                <MadTabNav>
                                    <MadTabNavItem>페이지 선택</MadTabNavItem>
                                    <MadTabNavItem>페이지 입력</MadTabNavItem>
                                </MadTabNav>
                                <MadTabContents>
                                    <Gap sm/>
                                    <TextbookPageSimpleList textbookPages={this.props.textbookDetail.pages}
                                                            selectedPages={textbookPages}
                                                            selectLimit={100}
                                                            setTextbookPages={this.setTextbookPages}
                                    />
                                </MadTabContents>
                                <MadTabContents>
                                    <Gap sm/>
                                    <TextbookPageInputPicker textbookPages={this.props.textbookDetail.pages}
                                                             selectedPages={textbookPages}
                                                             selectLimit={100}
                                                             setTextbookPages={this.setTextbookPages}
                                    />
                                </MadTabContents>
                            </MadTab>
                        }
                        {
                            pickerType === PICKER_TYPE.CHAPTER &&
                            <ChapterPicker chapters={this.props.chapters}
                                           selectedChapters={chapters}
                                           onSelectChapters={chapters => {
                                                       this.setState({chapters})
                                                   }}
                                           selectLimit={50}
                            />
                        }
                        <Gap/>
                        {
                            pickerType !== PICKER_TYPE.NONE &&
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <MadButton text="이전" ghost onClick={() => this.setPickerType(PICKER_TYPE.NONE)}/>
                                <MadButton text="다음" onClick={() => this.updateHomeworkRange()} disabled={textbookPages.length === 0 && chapters.length === 0}/>
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}

class TextbookPageSimpleList extends PureComponent {

    onSelectPage = page => e => {
        const {selectedPages, selectLimit} = this.props;
        let isPageExist = selectedPages.filter(p => p === page).length === 0;
        let pages = isPageExist ? [...selectedPages, page].sort((a, b) => this.textbookPageSort(a, b)) : selectedPages.filter(p => p !== page);

        if (pages.length <= selectLimit)
            this.props.setTextbookPages(pages);
        else
            alert(`페이지 선택은 ${selectLimit}페이지 까지 가능합니다.`);
    };

    textbookPageSort(a, b) {
        return a.pageNumber - b.pageNumber;
    }

    render() {
        const {
            className,
            textbookPages,
            selectedPages
        } = this.props;
        return (
            <div className={className}>
                {
                    textbookPages &&
                    <div style={{
                        overflow: 'auto',
                        height: 'calc(100vh - 265px)',
                        maxHeight: 400,
                        minHeight: 150,
                    }}>
                        {
                            textbookPages &&
                            textbookPages.map((page, i) => {
                                return (
                                    <MadCheckbox
                                        key={`textbook-page-${i}`}
                                        text={page.pageNumber}
                                        onChange={this.onSelectPage(page)}
                                        disabled={false}
                                        checked={selectedPages.includes(page)}
                                        style={{display: 'flex', justifyContent: 'space-between'}}
                                        className="is-vcentered simple-list-item bottom-line-light">
                                    </MadCheckbox>
                                )
                            })
                        }
                    </div>
                }
                {
                    !textbookPages && <MadLoadingView showText={true}/>
                }
            </div>
        );
    }
}


class TextbookPageInputPicker extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: "",
            inputPages: [],
            inputPagesError: false,
        }
    }

    onSelectPage = page => e => {
        const {selectedPages, selectLimit} = this.props;
        let pages = selectedPages.filter(p => p !== page);

        if (pages.length <= selectLimit)
            this.props.setTextbookPages(pages);
    };

    inputPages = e => {
        let inputValue = e.target.value.replace(/\s+/g, ",").replace(/,+/g, ",");
        let lastChar = inputValue.charAt(inputValue.length - 1);
        let block = inputValue.slice(0, lastChar === ',' ? inputValue.length - 1 : inputValue.length).split(',');

        let pattern1 = /^[0-9]+$/;
        let pattern2 = /^([0-9])+-?([0-9])*$/;
        let pattern3 = /^$/;

        if (block.map(b => pattern1.test(b) || pattern2.test(b) || pattern3.test(b)).every(e => e)) {
            this.setState({
                inputValue: inputValue,
                inputPages: block,
                inputPagesError: false,
            });
        } else {
            this.setState({
                inputValue: inputValue,
                inputPagesError: true,
            });
        }
    };

    selectInputPages = () => {
        let inputPages = this.state.inputPages;

        let pages = [];
        inputPages.map(b => {
            let t = [];
            if (b.indexOf("-") !== -1) {
                let temp = b.split("-");
                return pages.push(...t.range(temp[0], temp[1]));
            }
            return pages.push(b * 1);
        });

        let uniqPages = pages.slice()
            .sort(function (a, b) {
                return a - b;
            })
            .reduce(function (a, b) {
                if (a.slice(-1)[0] !== b) a.push(b);
                return a;
            }, []);

        this.setTextbookPagesToArray(uniqPages);
    };

    setTextbookPagesToArray(pages) {
        const {selectLimit} = this.props;
        let textbookDetailPages = this.props.textbookPages;
        let selectedTextbookPages = [];

        pages.forEach(p => {
            let foundPage = textbookDetailPages.find(t => t.pageNumber === p);
            if (foundPage) {
                selectedTextbookPages.push(foundPage);
            }
        });

        if (selectedTextbookPages.length <= selectLimit)
            this.props.setTextbookPages(selectedTextbookPages);
        else
            alert(`페이지 선택은 ${this.props.selectLimit}페이지 까지 가능합니다.`);

    }

    render() {
        const {
            className,
            textbookPages,
            selectedPages,
        } = this.props;

        const {
            inputValue,
            inputPagesError
        } = this.state;
        return (
            <div className={className}>
                {
                    textbookPages &&
                    <div>
                        <MadLabeled label="페이지" labelAlign="left" labelWidth="15%">
                            <MadInput text={inputValue}
                                      placeholder="예: 1-5, 8, 11-13"
                                      width="100%"
                                      errorMessage={inputPagesError ? "잘못된 입력입니다. 예: 1-5,8,11-13" : ""}
                                      onChange={this.inputPages}
                            />
                            <Gap sm h/>
                            <MadButton text="선택"
                                       disabled={inputPagesError}
                                       onClick={this.selectInputPages}/>
                        </MadLabeled>
                        <div className="selectedInputPages-wrapper">
                            {
                                selectedPages.length !== 0 &&
                                selectedPages.map((st, i) => {
                                    return (
                                        <div key={`selectedInputPages-${i}`} className="selectedInputPages">
                                            <MadCheckbox text={st.pageNumber}
                                                         onChange={this.onSelectPage(st)}
                                                         disabled={false}
                                                         checked={true}
                                                         style={{display: 'block'}}/>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                }
                {
                    !textbookPages && <MadLoadingView showText={true}/>
                }
            </div>
        );
    }
}
