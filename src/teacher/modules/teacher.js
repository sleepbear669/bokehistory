import loginService from 'shared/service/loginService'
import academyService from 'shared/service/academyService';
import usersService from 'shared/service/usersService';
import contractService from 'shared/service/contractService';

export const AUTH_LOGIN = 'AUTH_LOGIN';
export const FETCH_STUDENTS = 'FETCH_STUDENTS';
export const FETCH_USER = 'FETCH_USER';
export const FETCH_TOAD_TOKEN = 'FETCH_TOAD_TOKEN';

export function login(username, password, remember = false) {
    return (dispatch) => loginService.login({username, password, remember})
        .then(r => {
            dispatch({type: AUTH_LOGIN, authToken: r.token, user: r.user});
            return r;
        });
}

export function fetchStudents() {
    return (dispatch) => academyService.fetchStudents()
        .then(r => {
            dispatch({type: FETCH_STUDENTS, students: r});
            return r;
        });
}

export function fetchUserInfo() {
    return (dispatch) => usersService.fetchUserInfo()
        .then(r => {
            dispatch({type: FETCH_USER, user: r});
            return r;
        });
}

export function fetchToadToken() {
    return (dispatch) => loginService.fetchToadToken()
        .then(r => {
            dispatch({type: FETCH_TOAD_TOKEN, toadToken: r});
            return r;
        })
}

export function checkSignComplete() {
    return async () =>  {
        return await contractService.checkSignComplete();
    }
}

export function isSignCompleted() {
    return async (dispatch) =>  {
        return await contractService.isSignCompleted();
    }
}

export function isNewContractAcademy() {
    return async (dispatch) =>  {
        return await contractService.isNewContractAcademy();
    }
}


const ACTION_HANDLERS = {
    [AUTH_LOGIN]: (state, action) => ({
        ...state,
        authToken: action.authToken,
        user: action.user
    }),
    [FETCH_STUDENTS]: (state, action) => ({
        ...state,
        students: action.students
    }),
    [FETCH_USER]: (state, action) => ({
        ...state,
        user: action.user,
        roles: action.user.authorities.map(a => a.authority)
    }),
};

const initialState = {
    authToken: '',
    user: {},
    students: [],
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
