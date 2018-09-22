import React from 'react';
import './CourseListItem.scss';
import {
    MadButton,
    MadSubTitle,
    MadDropdown,
    MadBarChart,
    MadLocalDateFormat,
} from "madComponents";

export const CourseListItem = (props) => (
    <div className="card is-flex is-vcentered course-list-item" style={{minHeight: 96, marginBottom: 16, padding: 24, cursor: 'pointer'}} onClick={props.onClickCourse && props.onClickCourse(props.course)}>
        <div className="flex-8">
            <MadSubTitle text={props.course.title} style={{marginBottom: 8}}/>
            <span className="font-color-text-light">{props.course.textbook.title}</span>
        </div>
        <div className="flex-4 hide-when-w-768">
            <span style={{marginRight: 8}}>진행률</span>
            <MadBarChart value={props.percent} measure="%" style={{width: '70%'}}/>
        </div>
        {
            !props.isStudent && [
                <div className="flex-3" style={{textAlign: 'center'}} key="st">
                    {
                        props.course.students.length === 0 &&
                        <span className="font-color-text-light">학생이 없습니다</span>
                    }
                    {
                        props.course.students.length === 1 &&
                        `${props.course.students[0].nickname}`
                    }
                    {
                        props.course.students.length > 1 &&
                        `${props.course.students[0].nickname}외 ${props.course.students.length - 1}명`
                    }
                </div>,
                <div className="flex-2 hide-when-w-850" style={{textAlign: 'center'}} key="dt">
                    {
                        <MadLocalDateFormat range={false} localDate={props.course.createdDate}/>
                    }
                </div>
            ]
        }
        <div className="flex-2" style={{textAlign: 'center'}}>
            {
                props.course.students.length > 0 && props.onClickAnswer &&
                <MadButton text="채점" sm ghost onClick={props.onClickAnswer(props.course)}/>
            }
            {
                props.ctaText && props.onClickCta &&
                <MadButton text={props.ctaText} sm ghost onClick={props.onClickCta(props.course)}/>
            }
        </div>
        {
            props.onClickDelete &&
            <div className="flex-1" style={{textAlign: 'center'}}>
                <MadDropdown alignRight>
                    <MadButton icon="dots-vertical" sm ghost2 square style={{color: '#757575'}}/>
                    <li onClick={props.onClickDelete(props.course)} className="danger">삭제</li>
                </MadDropdown>
            </div>
        }
    </div>
);

export default CourseListItem
