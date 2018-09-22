import React from 'react'
import {mount} from 'enzyme'
import MadButton from '../src/madComponents/MadButton'

describe('MadButton', () => {
    it("to be defined", () => {
        const button = mount(<MadButton/>);
        expect(button).toBeDefined();
    });

    it("inner text", () => {
        const button = mount(<MadButton text="btn text!"/>);
        expect(button.text()).toEqual("btn text!");
    });

    it("class by type", () => {
        const button = mount(<MadButton text="btn text!"/>);
        expect(button.hasClass("mad-btn-primary")).toBeTruthy();

        const button2 = mount(<MadButton type="secondary"/>);
        expect(button2.hasClass("mad-btn-primary")).toBeFalsy();
        expect(button2.hasClass("mad-btn-secondary")).toBeTruthy();

        const button3 = mount(<MadButton type="ghost"/>);
        expect(button3.hasClass("mad-btn-primary")).toBeFalsy();
        expect(button3.hasClass("mad-btn-ghost")).toBeTruthy();

        const button4 = mount(<MadButton type="ghost2"/>);
        expect(button4.hasClass("mad-btn-primary")).toBeFalsy();
        expect(button4.hasClass("mad-btn-ghost2")).toBeTruthy();
    });

    it("can click", () => {
        let value = 0;
        const button = mount(<MadButton text="btn text!" onClick={() => value = 10}/>);
        button.find('button').simulate('click');
        expect(value).toEqual(10);
    });

    it("cannot click when disabled", () => {
        let value = 0;
        const button = mount(<MadButton text="btn text!" onClick={() => value = 10} disabled/>);
        button.find('button').simulate('click');
        expect(value).toEqual(0);
    });
});
