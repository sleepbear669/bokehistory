import React from 'react';
import {mount} from 'enzyme';
import sinon from 'sinon';
import MadSlider from '../src/madComponents/MadSlider'

describe('MadSlider', () => {

    it("to be defined", () => {
        const madSlider = mount(<MadSlider/>);
        expect(madSlider).toBeDefined();
        expect(madSlider.find('input').node.max).toEqual("100");
        expect(madSlider.find('input').node.min).toEqual("0");
        expect(madSlider.state('value')).toEqual(0);
    });

    it("to be init", () => {
        const min = 10;
        const max = 20;
        const value = 15;
        const madSlider = mount(<MadSlider min={min} max={max} defaultValue={value}/>);
        expect(madSlider.find('input').node.min).toEqual(min.toString());
        expect(madSlider.find('input').node.max).toEqual(max.toString());
        expect(madSlider.state('value')).toEqual(value);
    });
});
