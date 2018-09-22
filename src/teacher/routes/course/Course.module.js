import produce from "immer"

import courseService from 'shared/service/courseService';
import textbookService from 'shared/service/textbookService';

export const FETCH_COURSE = 'FETCH_COURSE';
export const ADD_STUDENT = 'ADD_STUDENT';
export const RENAME_COURSE = 'RENAME_COURSE';
export const FETCH_TEXTBOOKDETAIL = 'FETCH_TEXTBOOKDETAIL';
export const FETCH_SUMMARY = 'FETCH_SUMMARY';
export const FETCH_SUMMARIES = 'FETCH_SUMMARIES';

export function fetchCourse(id) {
    return dispatch => {
        return courseService.get(id).then(r => {
            dispatch({type: FETCH_COURSE, course: r});
            return r;
        })
    };
}

export function addStudent(courseId, studentId) {
    return dispatch => {
        return courseService.addStudent(courseId, studentId).then(r => {
            dispatch({type: ADD_STUDENT, result: r});
            return r;
        })
    };
}

export function fetchTextbookDetail(textbookId) {
    return dispatch => {
        return textbookService.fetchTextbookDetail(textbookId).then(r => {
            dispatch({type: FETCH_TEXTBOOKDETAIL, textbookDetail: r, textbookDetailByChapterName: r.pages.groupBy(t => t.representativeChapterName)});
            return r;
        })
    };
}

export function renameCourse(courseId, newTitle) {
    return dispatch => {
        return courseService.rename(courseId, newTitle).then(r => {
            dispatch({type: RENAME_COURSE, result: r, newTitle});
            return r;
        })
    };
}

export function fetchStudentSummary(courseId, studentId) {
    return dispatch => {
        if (studentId) {
            return courseService.fetchStudentSummary(courseId, studentId).then(studentSummary => {
                dispatch({type: FETCH_SUMMARY, studentSummary});
                return studentSummary;
            });
        } else {
            return courseService.fetchStudentSummaries(courseId).then(studentSummaries => {
                let summariesByStudentId = studentSummaries.reduce((a, b) => {
                    a[b.studentId] = b;
                    return a;
                }, {});

                dispatch({type: FETCH_SUMMARIES, studentSummaries, summariesByStudentId});
                return studentSummaries;
            });
        }
    };
}

const ACTION_HANDLERS = {
    [FETCH_COURSE]: produce((draft, action) => {
        draft.course = action.course;
    }),
    [RENAME_COURSE]: produce((draft, action) => {
        draft.course.title = action.newTitle;
    }),
    [FETCH_TEXTBOOKDETAIL]: produce((draft, action) => {
        draft.textbookDetail = action.textbookDetail;
        draft.textbookDetailByChapterName = action.textbookDetailByChapterName;
    }),
    [FETCH_SUMMARY]: produce((draft, action) => {
        draft.summariesByStudentId[action.studentSummary.studentId] = action.studentSummary;
    }),
    [FETCH_SUMMARIES]: produce((draft, action) => {
        draft.studentSummaries = action.studentSummaries;
        draft.summariesByStudentId = action.summariesByStudentId;
    })
};

const initialState = {
    course: null,
    textbookDetail: null,
    textbookDetailByChapterName: null,
    studentSummaries: [],
    summariesByStudentId: {},
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
