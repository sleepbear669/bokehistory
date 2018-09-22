import produce from 'immer';

import reportService from 'shared/service/reportService';
import courseService from 'shared/service/courseService';
import moment from "moment/moment";

export const FETCH_COURSE = 'FETCH_COURSE';
export const FETCH_REPORT_DATA = 'FETCH_REPORT_DATA';
export const SEND_SMS = 'SEND_SMS';
export const LIST_SMS = 'LIST_SMS';

export function fetchCourse(id) {
    return (dispatch, getState) => {
        return courseService.get(id).then(r => {
            dispatch({type: FETCH_COURSE, course: r});
            return r;
        })
    };
}

export function createReportData(courseId, studentId, year, weekOfYearFrom, weekOfYearTo) {
    return (dispatch, getState) => {
        return reportService.createReportData(courseId, studentId, year, weekOfYearFrom, weekOfYearTo).then(r => {
            // dispatch({type: CREATE_REPORT_DATA, course: r});
            return r;
        })
    }
}

export function getReportData(courseId, studentId, year, weekOfYearFrom, weekOfYearTo) {
    return async (dispatch, getState) => {
        let reportData = await reportService.getReportData(courseId, studentId, year, weekOfYearFrom, weekOfYearTo);
        dispatch({type: FETCH_REPORT_DATA, reportData});
        return reportData;
    }
}

export function sendSms({reports, phoneNumber, courseId, studentId, key}) {
    return async dispatch => {
        let result = await reportService.sendSms({phoneNumber, courseId, studentId, key, hashs: reports.map(r => r.hash)});
        dispatch({type: SEND_SMS, result});
        return result;
    }
}

export function listSms() {
    return async (dispatch, getState) => {
        let result = await reportService.listSms(getState().reportList.course.id);
        dispatch({type: LIST_SMS, result});
        return result;
    }
}


const ACTION_HANDLERS = {
    [FETCH_COURSE]: produce((draft, action) => {
        draft.course = action.course;
    }),
    [SEND_SMS]: produce((draft, action) => {
    }),
    [LIST_SMS]: produce((draft, action) => {
        let recentSmsHistory = {};
        Object.entries(action.result.groupBy(s => s.studentId)).forEach(([key, list]) => {
            let recent = list.sortBy('createdDate').reverse()[0];
            recentSmsHistory[key] = recent;

            let yearWeek = recent.messageKey.split('/');

            let from = moment(`${yearWeek[0]}W${yearWeek[1].zf(2)}`).format('MM/DD');
            let to = moment(`${yearWeek[0]}W${(yearWeek[2]).zf(2)}`).add(6, 'day').format('MM/DD');

            recent.info = `${from} ~ ${to} 기간동안 학습한 내용`;
        });

        draft.recentSmsHistory = recentSmsHistory;
    }),
};

const initialState = {
    course: null,
    recentSmsHistory: {},
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
