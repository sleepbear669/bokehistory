import produce from 'immer';

import courseService from 'shared/service/courseService';

export const FETCH_COURSE = 'FETCH_COURSE';
export const ADD_STUDENT = 'ADD_STUDENT';
export const REMOVE_STUDENT = 'REMOVE_STUDENT';

export function fetchCourse(id) {
    return (dispatch, getState) => {
        return courseService.get(id).then(r => {
            dispatch({type: FETCH_COURSE, course: r});
            return r;
        })
    };
}

export function addStudent(courseId, studentId) {
    return (dispatch, getState) => {
        return courseService.addStudent(courseId, studentId).then(r => {
            dispatch({type: ADD_STUDENT, result: r});
            return r;
        })
    };
}

export function removeStudent(courseId, studentId) {
    return (dispatch, getState) => {
        return courseService.removeStudent(courseId, studentId).then(r => {
            dispatch({type: REMOVE_STUDENT, result: r});
            return r;
        })
    };
}

const ACTION_HANDLERS = {
    [FETCH_COURSE]: produce((draft, action) => {
        draft.course = action.course;
    }),
};

const initialState = {
    course: null,
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
