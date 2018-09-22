import produce from "immer"

import courseService from 'shared/service/courseService';
import textbookService from 'shared/service/textbookService';

export const FETCH_COURSES = 'FETCH_COURSES';
export const FETCH_TEXTBOOKS = 'FETCH_TEXTBOOKS';
export const FETCH_COMPLETE_TEXTBOOKS = 'FETCH_COMPLETE_TEXTBOOKS';
export const CREATE_COURSE = 'CREATE_COURSE';
export const FETCH_COURSE_SUMMARY = 'FETCH_COURSE_SUMMARY';
export const DELETE_COURSE = 'DELETE_COURSE';
export const ROLLBACK_DELETE_COURSE = 'ROLLBACK_DELETE_COURSE';

export function fetchCourses() {
    return (dispatch, getState) => {
        return courseService.list().then(r => {
            dispatch({type: FETCH_COURSES, courses: r});
            return r;
        })
    };
}

export function fetchTextbooks() {
    return (dispatch, getState) => {
        return textbookService.fetchTextbooks().then(r => {
            dispatch({type: FETCH_TEXTBOOKS, textbooks: r});
            return r;
        })
    };
}

export function fetchCompleteTextbooks() {
    return (dispatch, getState) => {
        return textbookService.fetchCompleteTextbooks().then(textbooks => {
            textbooks.sortBy(_ => _.rootChapter.displayOrder, 'title');
            dispatch({type: FETCH_COMPLETE_TEXTBOOKS, textbooks});
            return textbooks;
        })
    };
}

export function createCourse(title, textbookId, studentIds) {
    return (dispatch, getState) => {
        return courseService.create({title, textbookId, studentIds}).then(r => {
            dispatch({type: CREATE_COURSE, createResult: r});
            return r;
        })
    };
}

export function fetchCourseSummary(courseId) {
    return (dispatch, getState) => {
        return courseService.fetchCourseSummary(courseId).then(r => {
            dispatch({type: FETCH_COURSE_SUMMARY, courseSummary: r, courseId});
            return r;
        })
    };
}

export function deleteCourse(courseId) {
    return (dispatch, getState) => {
        return courseService.delete(courseId).then(r => {
            dispatch({type: DELETE_COURSE, result: r});
            return r;
        })
    };
}

export function rollbackDeleteCourse(courseId) {
    return (dispatch, getState) => {
        return courseService.rollbackDelete(courseId).then(r => {
            dispatch({type: ROLLBACK_DELETE_COURSE, result: r});
            return r;
        })
    };
}

const ACTION_HANDLERS = {
    [FETCH_COURSES]: produce((draft, action) => {
        draft.courses = action.courses;
        draft.textbooksInCourses = action.courses
            .map(c => c.textbook)
            .map(t => ({
                value: t,
                label: t.title
            }))
            .distinctBy(t => t.value.id);
    }),
    [FETCH_TEXTBOOKS]: produce((draft, action) => {
        draft.textbooks = action.textbooks.map(t => ({
            ...t,
            label: t.title,
            value: t.id
        }));
    }),
    [FETCH_COMPLETE_TEXTBOOKS]: produce((draft, action) => {
        draft.textbooks = action.textbooks.map(t => ({
            ...t,
            label: t.title,
            value: t.id
        }));
    }),
    [CREATE_COURSE]: produce((draft, action) => {
        draft.createResult = action.createResult
    }),
    [FETCH_COURSE_SUMMARY]: produce((draft, action) => {
        draft.courseSummaries[action.courseId] = action.courseSummary;
    }),
    [DELETE_COURSE]: produce((draft, action) => {
        draft.courseDeletedResult = action.result;
    })
};

const initialState = {
    courses: null,
    textbooks: null,
    textbooksInCourses: null,
    courseSummaries: [],
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
