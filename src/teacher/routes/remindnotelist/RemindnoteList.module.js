import produce from 'immer';

import learningService from "../../../shared/service/learningService";
import remindNoteService from "../../../shared/service/remindNoteService";

export const FETCH_TEXTBOOKLEARNINGS = 'FETCH_TEXTBOOKLEARNINGS';
export const FETCH_RECOMMENDLAERNINGS = 'FETCH_RECOMMENDLAERNINGS';
export const CREATE_REMIND_NOTE = 'CREATE_REMIND_NOTE';

export function fetchTextbookLearnings(courseId, studentId) {
    return async dispatch => {
        let textbookLearnings = await learningService.fetchLearnings(courseId, studentId);
        dispatch({type: FETCH_TEXTBOOKLEARNINGS, textbookLearnings: textbookLearnings.filter(l => l.complete)});
    }
}

export function fetchRecommendLearnings(courseId, studentId) {
    return async dispatch => {
        let recommendLearnings = await learningService.fetchRecommendLearnings(courseId, studentId);
        dispatch({type: FETCH_RECOMMENDLAERNINGS, recommendLearnings: recommendLearnings.filter(l => l.complete)});
    }
}

export function createRemindNoteByTextbook(courseId, pageIds, studentId) {
    return async dispatch => {
        let createResult = await remindNoteService.createByTextbook(courseId, pageIds, studentId);
        dispatch({type: CREATE_REMIND_NOTE, createResult});
        return createResult;
    }
}

export function createRemindNoteByMadLearning(courseId, learningIds, studentId) {
    return async dispatch => {
        let createResult = await remindNoteService.createByMadLearning(courseId, learningIds, studentId);
        dispatch({type: CREATE_REMIND_NOTE, createResult});
        return createResult;
    }
}

const ACTION_HANDLERS = {
    [FETCH_TEXTBOOKLEARNINGS]: produce((draft, action) => {
        draft.textbookLearnings = action.textbookLearnings;
    }),
    [FETCH_RECOMMENDLAERNINGS]: produce((draft, action) => {
        draft.recommendLearnings = action.recommendLearnings;
    }),
    [CREATE_REMIND_NOTE]: produce((draft, action) => {
        draft.createResult = action.createResult;
    })
};

const initialState = {
    textbookLearnings: null,
    recommendLearnings: null,
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
