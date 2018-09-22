import React from 'react';
import './Header.scss';
import {MadProfile, Gap} from "madComponents";

export const Header = () => (
    <div className="teacher-header">
        <div className="header-container">
            <div className="pull-left header-left">
                <div className="side-menu-toggle-btn">
                    icon
                </div>
                <Gap sm h/>
                <div className="service-logo">
                    PocketMath
                </div>
            </div>
            <div className="pull-right header-right">
                <MadProfile img="http://blog.donga.com/sjdhksk/files/2014/02/7784600601393322345.jpg" name="teacher"/>
            </div>
        </div>
    </div>
);

export default Header
