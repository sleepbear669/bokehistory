import produce from "immer";

export const AUTH_LOGIN = 'AUTH_LOGIN';
import academyService from 'shared/service/academyService'
import loginService from "shared/service/loginService";

export const FETCH_STUDENTS = 'FETCH_STUDENTS';
export const CREATE_STUDENTS = 'CREATE_STUDENTS';
export const ACTIVATE_STUDENTS = 'ACTIVATE_STUDENTS';
export const DEACTIVATE_STUDENTS = 'DEACTIVATE_STUDENTS';
export const UPDATE_STUDENTS = 'UPDATE_STUDENTS';
export const UPDATE_STUDENTS_PASSWORD = 'UPDATE_STUDENTS_PASSWORD';

export function fetchStudents() {
    return (dispatch) => academyService.fetchStudents()
        .then(r => {
            dispatch({type: FETCH_STUDENTS, students: orderStudents(r)});
            return r;
        });
}

function orderStudents(students) {
    let idx = 1;
    let orderEnableStudents = students
        .filter(s => s.userState === 'ACTIVE')
        .sort((a, b) => order(a.id, b.id))
        .map(s => {
            s.idx = idx++;
            return s;
        });
    idx = 1;
    let orderDisableStudents = students
        .filter(s => s.userState !== 'ACTIVE')
        .sort((a, b) => order(b.id, a.id))
        .map(s => {
            s.idx = idx++;
            return s;
        });
    return [...orderEnableStudents, ...orderDisableStudents];
}

function order(a, b) {
    if (a > b)
        return 1;
    else if (a < b)
        return -1;
    else
        return 0;
}

export function createStudent(param) {
    return (dispatch) => academyService.createSimpleStudent(param)
        .then(r => {
            dispatch({type: CREATE_STUDENTS, students: r});
            return r;
        });
}

export function deactivateStudent(id) {
    return (dispatch) => academyService.deactivateStudent(id)
        .then(r => {
            dispatch({type: DEACTIVATE_STUDENTS, students: r});
            return r;
        });
}

export function activateStudent(id) {
    return (dispatch) => academyService.activateStudent(id)
        .then(r => {
            dispatch({type: ACTIVATE_STUDENTS, students: r});
            return r;
        });
}


export function updateStudent(param) {
    return (dispatch) => academyService.updateStudent(param)
        .then(r => {
            dispatch({type: UPDATE_STUDENTS, students: r});
            return r;
        });
}

export function forcedUpdateUserPassword(userId, params) {
    return (dispatch) => academyService.forcedUpdateUserPassword(userId, params)
        .then(r => {
            dispatch({type: UPDATE_STUDENTS_PASSWORD, result: r});
            return r;
        });
}

export function switchUser(student) {
    return async (dispatch) => {
        loginService.switchUserLogin(student.username).then(() => {
            location.href = '/';
        });
    }
}

const ACTION_HANDLERS = {
    [AUTH_LOGIN]: produce((draft, action) => {
        draft.authToken = action.authToken;
        draft.user = action.user;
    }),
    [FETCH_STUDENTS]: produce((draft, action) => {
        draft.students = action.students
    })
};

const initialState = {
    students: null,
    roles: [],
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
