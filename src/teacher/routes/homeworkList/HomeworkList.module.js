import produce from 'immer';

import homeworkService from 'shared/service/homeworkService';
import learningService from 'shared/service/learningService';
import chapterService from 'shared/service/chapterService';
import ImageSizeResolver from "shared/ImageSizeResolver";
import ImageUrlResolver from "shared/ImageUrlResolver";

export const CREATE_HOMEWORK = 'CREATE_HOMEWORK';
export const FETCH_HOMEWORKS = 'FETCH_HOMEWORKS';
export const FETCH_HOMEWORK = 'FETCH_HOMEWORK';
export const FETCH_HOMEWORK_LEARNINGS = 'FETCH_HOMEWORK_LEARNINGS';
export const FETCH_HOMEWORK_LEARNING = 'FETCH_HOMEWORK_LEARNING';
export const SUBMIT_ANSWER = 'SUBMIT_ANSWER';
export const ADD_STUDENT_TO_HOMEWORK = 'ADD_STUDENT_TO_HOMEWORK';
export const REMOVE_STUDENT_TO_HOMEWORK = 'REMOVE_STUDENT_TO_HOMEWORK';
export const FETCH_CANDIDATES = 'FETCH_CANDIDATES';
export const DELETE_HOMEWORK = 'DELETE_HOMEWORK';
export const FETCH_CHAPTERS = 'FETCH_CHAPTERS';
export const FETCH_LEARNING_STATS = 'FETCH_LEARNING_STATS';

export function fetchCandidates(params) {
    return (dispatch, getState) => {
        return homeworkService.fetchCandidates(params).then(candidates => {

            setLevelCount(candidates);

            return Promise.all(candidates.units.map(resolveImage))
                .then(r => {
                    dispatch({type: FETCH_CANDIDATES, candidates: candidates});
                    return candidates;
                });
        })
    }
}

function setLevelCount(lu) {
    lu.levelCount = {'-1': 0, '1': 0, '2': 0, '3': 0};
    lu.units.map(unit => {
        lu.levelCount = {
            ...lu.levelCount,
            [unit.level]: lu.levelCount[unit.level] ? lu.levelCount[unit.level] + 1 : 1,
        }
    });
}

async function resolveImage(lu) {
    lu.candidatesImageUrl = ImageUrlResolver.unit(lu.filePathMd5);
    let size = await ImageSizeResolver.size(lu.candidatesImageUrl);
    lu.candidatesImageAspectRatio = size.aspectRatio;
}

export function createHomework(params) {
    return (dispatch, getState) => {
        return homeworkService.createHomework(params).then(r => {
            return r;
        })
    }
}

function textbookPageSort(a, b) {
    return a.pageNumber - b.pageNumber;
}

export function fetchHomework(courseId) {
    return (dispatch, getState) => {
        return homeworkService.fetchHomework(courseId).then(r => {
            dispatch({
                type: FETCH_HOMEWORK,
                homeworkDetail: {
                    ...r,
                    textbookPages: r.textbookPages.sort(textbookPageSort)
                }
            });
            return r;
        })
    }
}

export function fetchHomeworks(courseId) {
    return (dispatch, getState) => {
        return homeworkService.fetchHomeworks(courseId).then(homeworks => {
            dispatch({
                type: FETCH_HOMEWORKS,
                homeworkList: homeworks.map(homework => {
                    return {
                        ...homework,
                        textbookPages: homework.textbookPages.sort(textbookPageSort),
                    }
                })
            });
            return homeworks;
        })
    }
}

export function createHomeworkLearnings(assignId, studentId) {
    return (dispatch, getState) => {
        return homeworkService.createHomeworkLearnings(assignId, studentId).then(r => {
            return r;
        })
    }
}

export function fetchHomeworkLearnings(assignId) {
    return (dispatch, getState) => {
        return homeworkService.fetchHomeworkLearnings(assignId).then(r => {
            dispatch({type: FETCH_HOMEWORK_LEARNINGS, learnings: r});
            return r;
        })
    }
}

export function fetchLearning(id) {
    return (dispatch, getState) => {
        return learningService.fetchLearning(id).then(r => {
            dispatch({type: FETCH_HOMEWORK_LEARNING, learning: r});
            return r;
        })
    }
}

export function submitAnswer(learningBundleId, answers) {
    return (dispatch, getState) => {
        return learningService.submitAnswer(learningBundleId, answers).then(r => {
            dispatch({type: SUBMIT_ANSWER, result: r});
            return r;
        });
    }
}

export function resetLearning(learningBundleId) {
    return (dispatch, getState) => {
        return learningService.resetLearning(learningBundleId).then(r => {
            return r;
        });
    }
}

export function addStudentsToHomework(assignId, students) {
    return (dispatch, getState) => {
        return homeworkService.addStudentsToHomework(assignId, students).then(r => {
            return r;
        })
    }
}

export function removeStudentsToHomework(assignId, students) {
    return (dispatch, getState) => {
        return homeworkService.removeStudentsToHomework(assignId, students).then(r => {
            return r;
        })
    }
}

export function deleteHomework(id) {
    return async (dispatch, getState) => {
        let result = await homeworkService.delete(id);
        dispatch({type: DELETE_HOMEWORK, result});
        fetchHomeworks(getState().course.course.id)(dispatch);
        return result;
    }
}

export function fetchLearningStats() {
    return async dispatch => {
        let learningStats = await learningService.fetchLearningStats();

        dispatch({type: FETCH_LEARNING_STATS, learningStats});
        return learningStats;
    }
}

export function fetchTopChapters() {
    return async (dispatch, getState) => {
        let result = await chapterService.fetchTopChaptersByRootChapterId(getState().course.textbookDetail.rootChapter.contentId).then(topChapters => {
            return Promise.all(topChapters.map(topChapter => {
                return chapterService.fetchLeafChaptersByTopChapterId(topChapter.contentId).then(leafChapters => {
                    return {
                        topChapter,
                        leafChapters
                    }
                });
            }));
        });
        dispatch({type: FETCH_CHAPTERS, result});
        return result;
    }
}

const ACTION_HANDLERS = {
    [FETCH_HOMEWORK]: produce((draft, action) => {
        draft.homeworkDetail = action.homeworkDetail
    }),
    [FETCH_HOMEWORKS]: produce((draft, action) => {
        draft.homeworkList = action.homeworkList
    }),
    [FETCH_HOMEWORK_LEARNINGS]: produce((draft, action) => {
        draft.learnings = action.learnings
    }),
    [FETCH_HOMEWORK_LEARNING]: produce((draft, action) => {
        draft.learning = action.learning;
    }),
    [SUBMIT_ANSWER]: produce((draft, action) => {
        draft.submitResult = action.result;
    }),
    [FETCH_CHAPTERS]: (state, action) => ({
        ...state,
        chapters: action.result
    }),
    [FETCH_CANDIDATES]: produce((draft, action) => {
        draft.candidates = action.candidates;
    }),
    [FETCH_LEARNING_STATS]: produce((draft, action) => {
        draft.learningStats = action.learningStats;
    })
};

const initialState = {
    course: null,
    textbookDetail: null,
    textbookDetailByChapterName: null,
    homeworkDetail: null,
    students: null,
    homeworkList: null,
    learnings: null,
    learning: null,
    candidates: null,
    chapters: null,
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
