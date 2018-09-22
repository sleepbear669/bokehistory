import React from 'react';
import {Route} from 'react-router-dom';
import CourseList from './courselist';
import Course from './course';
import CourseStudent from './coursestudent';
import CourseStudentAnswer from './coursestudentanswer';
import HomeworkList from './homeworkList';
import ReportList from './reportList';
import RemindnoteList from './remindnotelist';
import Students from './students';
import UserInfo from './userInfo';
import OpenHomework from './openHomework';
import RemindLearnings from './remindLearnings';
import RemindLearningsV2 from './remindLearningsV2';

export const createRoutes = (store) => (
    <div style={{height: '100%', width: '100%', margin: '0 auto'}}>
        <Route exact path="/teacher/courses" component={CourseList(store)}/>
        <Route path="/teacher/courses/:id" component={Course(store)}/>
        <Route exact path="/teacher/courses/:id/students" component={CourseStudent(store)}/>
        <Route exact path="/teacher/courses/:id/students/add" component={CourseStudent(store)}/>
        <Route exact path="/teacher/courses/:id/homeworkList" component={HomeworkList(store)}/>
        <Route exact path="/teacher/courses/:id/students/:studentId/:learningType" component={CourseStudentAnswer(store)}/>
        <Route exact path="/teacher/courses/:id/remindnoteList" component={RemindnoteList(store)}/>
        <Route exact path="/teacher/courses/:id/reportList" component={ReportList(store)}/>
        <Route path="/teacher/students" component={Students(store)}/>
        <Route path="/teacher/userInfo" component={UserInfo(store)}/>
        <Route path="/teacher/openHomeworks" component={OpenHomework(store)}/>
        <Route path="/teacher/remindLearnings" component={RemindLearnings(store)}/>
        <Route path="/teacher/remindLearningsV2" component={RemindLearningsV2(store)}/>
    </div>
);

export default createRoutes
