import React, {PureComponent} from 'react';
import './TextbookPageSimpleList.scss';
import {
    MadCheckbox,
    MadLoadingView
} from "madComponents";

export default class TextbookPageSimpleList extends PureComponent {

    render() {
        const {
            className,
            textbookPages,
            onSelectPage,
            selectedPages
        } = this.props;
        return (
            <div className={className}>
                {
                    textbookPages &&
                    <div>
                        <div className="row is-gapless is-vcentered bottom-line simple-list-header">
                            <div className="column is-4 padding-cell" style={{textAlign: 'left'}}>페이지</div>
                        </div>
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
                                            onChange={onSelectPage(page)}
                                            disabled={false}
                                            checked={selectedPages.includes(page)}
                                            style={{display: 'flex', justifyContent: 'space-between'}}
                                            className="is-vcentered simple-list-item bottom-line-light">
                                        </MadCheckbox>
                                    )
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
