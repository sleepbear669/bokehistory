import produce from 'immer';

import courseService from 'shared/service/courseService';
import textbookService from 'shared/service/textbookService';
import learningService from 'shared/service/learningService';

const FETCH_COURSE = 'FETCH_COURSE';
const FETCH_TEXTBOOK = 'FETCH_TEXTBOOK';
const FETCH_LEARNING = 'FETCH_LEARNING';
const FETCH_LEARNINGS = 'FETCH_LEARNINGS';
const FETCH_RECOMMEND_LEARNINGS = 'FETCH_RECOMMEND_LEARNINGS';
const CREATE_TEXTBOOK_LEARNING = 'CREATE_TEXTBOOK_LEARNING';
const CREATE_RECOMMEND_LEARNING = 'CREATE_RECOMMEND_LEARNING';
const SUBMIT_ANSWER = 'SUBMIT_ANSWER';
const CHECK_RECOMMEND_LEARNING_DUPLICATED = 'CHECK_RECOMMEND_LEARNING_DUPLICATED';
const FETCH_RECOMMEND_CANDIDATES = 'FETCH_RECOMMEND_CANDIDATES';

export function fetchCourse(id) {
    return (dispatch, getState) => {
        return courseService.get(id).then(r => {
            dispatch({type: FETCH_COURSE, course: r});
            return r;
        })
    };
}

export function fetchTextbook(id) {
    return (dispatch, getState) => {
        return textbookService.fetchTextbookDetail(id).then(r => {
            dispatch({type: FETCH_TEXTBOOK, textbook: r});
            return r;
        })
    };
}

export function fetchLearning(id) {
    return (dispatch, getState) => {
        return learningService.fetchLearning(id).then(r => {
            dispatch({type: FETCH_LEARNING, learning: r});
            return r;
        })
    };
}

export function fetchLearnings(courseId, studentId) {
    return (dispatch, getState) => {
        return learningService.fetchLearnings(courseId, studentId).then(r => {
            dispatch({type: FETCH_LEARNINGS, learnings: r});
            return r;
        })
    };
}

export function fetchRecommendLearnings(courseId, studentId) {
    return (dispatch, getState) => {
        dispatch({type: FETCH_RECOMMEND_LEARNINGS, learnings: null});
        return learningService.fetchRecommendLearnings(courseId, studentId).then(r => {
            dispatch({type: FETCH_RECOMMEND_LEARNINGS, learnings: r});
            return r;
        })
    };
}

export function createTextbookLearning(courseId, pageId, studentId) {
    return (dispatch, getState) => {
        return learningService.createTextbookLearning(courseId, pageId, studentId).then(r => {
            dispatch({type: CREATE_TEXTBOOK_LEARNING, createLearningResult: r});
            return r;
        });
    }
}

export function createRecommendLearning(option) {
    return (dispatch, getState) => {
        return learningService.createRecommendLearning(option).then(r => {
            dispatch({type: CREATE_RECOMMEND_LEARNING, createRecommendLearningResult: r, textbookLearningIds: option.learningIds});
            return r;
        });
    }
}

export function submitAnswer(learningBundleId, answers) {
    return (dispatch, getState) => {
        let newAnswer = answers.map(answer => {
            return {
                ...answer,
                value: null,
            }
        });
        return learningService.submitAnswer(learningBundleId, newAnswer).then(r => {
            dispatch({type: SUBMIT_ANSWER, result: r});
            return r;
        });
    }
}

export function resetLearning(learningBundleId) {
    return async (dispatch, getState) => {
        return await learningService.resetLearning(learningBundleId);
    }
}

export function checkDuplications(pageIds, studentId) {
    return async (dispatch, getState) => {
        let isDuplicated = await learningService.checkDuplications(getState().course.course.id, studentId, pageIds);
        dispatch({type: CHECK_RECOMMEND_LEARNING_DUPLICATED, isDuplicated});
        return isDuplicated;
    }
}

export function candidates(option) {
    return dispatch => {
        return learningService.recommendCandidates(option).then(r => {
            dispatch({type: FETCH_RECOMMEND_CANDIDATES, option, result: r});
        });
    }
}

function compare(a, b) {
    return a > b ? 1 : (a == b ? 0 : -1);
}

function sortByPage(a, b) {
    return compare(a.textbookPage.pageNumber, b.textbookPage.pageNumber);
}

function sortById(a, b) {
    return compare(a.id, b.id);
}

const ACTION_HANDLERS = {
    [FETCH_COURSE]: produce((draft, action) => {
        draft.course = action.course;
    }),
    [FETCH_TEXTBOOK]: produce((draft, action) => {
        draft.textbook = produce(action.textbook, draft => {
            draft.pages
                .filter(p => p.units.length > 0)
                .forEach(p => {
                    p.value = p.id;
                    p.label = p.pageNumber;
                });
        });
    }),
    [FETCH_LEARNING]: produce((draft, action) => {
        if (action.learning.type === 'TEXTBOOK') {
            draft.learnings = [...draft.learnings.filter(l => l.id !== action.learning.id), action.learning].sort(sortByPage);
        } else if (action.learning.type === 'RECOMMEND') {
            draft.recommendLearnings = [...draft.recommendLearnings.filter(l => l.id !== action.learning.id), action.learning].sort(sortById);
        }
    }),
    [FETCH_LEARNINGS]: produce((draft, action) => {
        draft.learnings = action.learnings;
    }),
    [FETCH_RECOMMEND_LEARNINGS]: produce((draft, action) => {
        draft.recommendLearnings = action.learnings;
    }),
    [CREATE_TEXTBOOK_LEARNING]: produce((draft, action) => {
        draft.learnings = [...draft.learnings.filter(l => l.id !== action.createLearningResult.learning.id), action.createLearningResult.learning].sort(sortByPage);
        draft.createLearningResult = action.createLearningResult;
    }),
    [CREATE_RECOMMEND_LEARNING]: produce((draft, action) => {
        draft.learnings.filter(l => action.textbookLearningIds.includes(l.id)).forEach(l => {
            let id = action.createRecommendLearningResult.learning.id;
            if (l.referredLearningIds) l.referredLearningIds.push(id);
            else l.referredLearningIds = [id];
        });
        draft.createRecommendLearningResult = action.createRecommendLearningResult;
        draft.recommendLearning = action.createRecommendLearningResult.learning;
    }),
    [SUBMIT_ANSWER]: produce((draft, action) => {
        draft.submitResult = action.result;
    }),
    [FETCH_RECOMMEND_CANDIDATES]: produce((draft, action) => {
        draft.candidatesResult = action.result;
    })
};

const initialState = {
    course: null,
    textbook: null,
    learnings: [],
    recommendLearnings: [],
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
