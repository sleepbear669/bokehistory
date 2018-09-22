import React from 'react'
import {mount} from 'enzyme'
import MadTitle from '../src/madComponents/MadTitle'

describe('MadTitle', () => {
    it("to be defined", () => {
        const title = mount(<MadTitle/>);
        expect(title).toBeDefined();
    });

    it("has text", () => {
        const text = 'madTitle';
        const title = mount(<MadTitle text={text}/>);
        expect(title.props().text).toEqual(text);
    });

    it("has children", () => {
        const text = 'madTitle';
        const title = mount(<MadTitle><span>{text}</span></MadTitle>);
        expect(title.children().text()).toEqual(text);
    });
});
