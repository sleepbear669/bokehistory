import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import MadInput from '../src/madComponents/MadInput'

describe('MadInput', () => {
    it("to be defined", () => {
        const madInput = mount(<MadInput/>);
        expect(madInput).toBeDefined();
    });

    it("have label and placeholder", () => {
        const label = 'madInputLabel';
        const placeholder = 'madInputPlaceholder';
        const madInput = mount(<MadInput label={label} placeholder={placeholder}/>);
        expect(madInput.state('label')).toEqual(label);
        expect(madInput.prop('placeholder')).toEqual(placeholder);
    });

    it("have empty value when don't pass text props", () => {
        const madInput = mount(<MadInput/>);
        const empty = '';
        expect(madInput.find('input').text()).toEqual(empty);
    });

    it("have passed text", () => {
        const onChange = sinon.spy();
        const text = 'madInputText';
        const madInput = mount(<MadInput text={text} onChange={onChange}/>);
        expect(madInput.state('textVal')).toEqual(text);
    });

    it("should be change", () => {
        const onChange = sinon.spy();
        const madInput = mount(<MadInput onChange={onChange}/>);
        madInput.find('input').simulate('change');
        expect(onChange.called).toBeTruthy();
    });

    it("should be madInput when change", () => {
        let madInputText = '';
        const expectValue = 'madInput';
        const onChange = e => madInputText = e.target.value;
        const madInput = mount(<MadInput onChange={onChange}/>);
        madInput.find('input').simulate('change', {target: {value: expectValue}});
        expect(madInputText).toEqual(expectValue);
    });

    it("should be press enter", () => {
        const onKeyPressEnter = sinon.spy();
        const madInput = mount(<MadInput onPressEnter={onKeyPressEnter}/>);
        madInput.find('input').simulate('keypress', {charCode: 13});
        expect(onKeyPressEnter.called).toBeTruthy();
    });
});
