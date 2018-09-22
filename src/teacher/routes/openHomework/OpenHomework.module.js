import produce from "immer"

import ImageSizeResolver from "shared/ImageSizeResolver";
import ImageUrlResolver from "shared/ImageUrlResolver";

import openHomeworkService from 'shared/service/openHomeworkService';
import chapterService from 'shared/service/chapterService';
import learningService from 'shared/service/learningService';

export const FETCH_OPEN_HOMEWORKS = 'FETCH_OPEN_HOMEWORKS';
export const FETCH_MORE_OPEN_HOMEWORKS = 'FETCH_MORE_OPEN_HOMEWORKS';
export const CREATE_OPEN_HOMEWORK = 'CREATE_OPEN_HOMEWORK';
export const DELETE_OPEN_HOMEWORK = 'DELETE_OPEN_HOMEWORK';
export const SET_OPEN_HOMEWORK = 'SET_OPEN_HOMEWORK';
export const SET_OPEN_HOMEWORK_LEARNING = 'SET_OPEN_HOMEWORK_LEARNING';
export const FETCH_OPEN_HOMEWORK_LEARNING = 'FETCH_OPEN_HOMEWORK_LEARNING';
export const FETCH_OPEN_HOMEWORK_LEARNINGS = 'FETCH_OPEN_HOMEWORK_LEARNINGS';
export const FETCH_CHAPTERS = 'FETCH_CHAPTERS';
export const FETCH_LEAF_CHAPTERS = 'FETCH_LEAF_CHAPTERS';
export const FETCH_CANDIDATES = 'FETCH_CANDIDATES';
export const OPEN_HOME_MODIFY_STUDENT = 'OPEN_HOME_MODIFY_STUDENT';
export const FETCH_LEARNING_STATS = 'FETCH_LEARNING_STATS';
export const FETCH_SCHOOLBOOKS = 'FETCH_SCHOOLBOOKS';

export function fetchOpenHomeworks() {
    return (dispatch, getState) => {
        return openHomeworkService.fetchOpenHomeworks().then(pagedOpenHomeworks => {
            dispatch({type: FETCH_OPEN_HOMEWORKS, openHomeworks: pagedOpenHomeworks.content, pagedOpenHomeworks});
        })
    }
}

export function fetchMoreOpenHomeworks() {
    return (dispatch, getState) => {
        const page = getState().openHomework.page + 1;
        return openHomeworkService.fetchOpenHomeworks(page).then(pagedOpenHomeworks => {
            dispatch({type: FETCH_MORE_OPEN_HOMEWORKS, openHomeworks: pagedOpenHomeworks.content, pagedOpenHomeworks, page});
        })
    }
}

export function deleteOpenHomework(assignId) {
    return (dispatch, getState) => {
        return openHomeworkService.deleteOpenHomework(assignId).then(r => {
            dispatch({type: DELETE_OPEN_HOMEWORK, assignId});
        })
    }
}

export function setOpenHomework(openHomework) {
    return async (dispatch, getState) => {
        let leafChapters = await chapterService.fetchLeafChapters({ids: openHomework.leafChapterIds.join(',')});
        dispatch({type: SET_OPEN_HOMEWORK, openHomework, leafChapters});
    }
}

export function createOpenHomework(params) {
    return (dispatch, getState) => {
        return openHomeworkService.createOpenHomework(params).then(openHomework => {
            if (openHomework.success) {
                dispatch({type: CREATE_OPEN_HOMEWORK, openHomework});
                fetchLearningStats();
                return openHomework;
            } else
                alert("문제지 생성에 실패하였습니다.")
        })
    }
}

export function fetchOpenHomeworkLearnings(assignId) {
    return (dispatch, getState) => {
        return openHomeworkService.fetchOpenHomeworkLearnings(assignId).then(r => {
            dispatch({type: FETCH_OPEN_HOMEWORK_LEARNINGS, learnings: r});
            return r;
        })
    }
}

export function setPropsLearning(learning) {
    return (dispatch, getState) => {
        dispatch({type: SET_OPEN_HOMEWORK_LEARNING, learning});
        return learning;
    }
}

export function submitAnswer(learningId, answers) {
    return async (dispatch, getState) => {
        let result = await learningService.submitAnswer(learningId, answers);
        if (result.success) {
            let learning = await learningService.fetchLearning(learningId);
            dispatch({type: FETCH_OPEN_HOMEWORK_LEARNING, learning});
        } else {
            alert("답안 제출에 실패했습니다")
        }
    }
}

export function resetLearning(learningId) {
    return async (dispatch, getState) => {
        let result = await learningService.resetLearning(learningId);
        if (result.success) {
            let learning = await learningService.fetchLearning(learningId);
            dispatch({type: FETCH_OPEN_HOMEWORK_LEARNING, learning});
        } else {
            alert("초기화에 실패했습니다.")
        }
    }
}

export function fetchTopChapters(contentId) {
    return async (dispatch, getState) => {
        let result = await chapterService.fetchTopChaptersByRootChapterId(contentId).then(topChapters => {
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

export function addStudentsToOpenHomework(assignId, studentId) {
    return async (dispatch, getState) => {
        if (await openHomeworkService.addStudentsToHomework(assignId, studentId)
            && await openHomeworkService.createOpenHomeworkLearning(assignId, studentId)) {
            let openHomework = await openHomeworkService.fetchOpenHomework(assignId);
            dispatch({type: SET_OPEN_HOMEWORK, openHomework});
            dispatch({type: OPEN_HOME_MODIFY_STUDENT, assignId, openHomework});
        }
    }
}

export function removeStudentsToOpenHomework(assignId, studentId) {
    return async (dispatch, getState) => {
        if (await openHomeworkService.removeStudentsToHomework(assignId, studentId)) {
            let openHomework = await openHomeworkService.fetchOpenHomework(assignId);
            dispatch({type: SET_OPEN_HOMEWORK, openHomework});
            dispatch({type: OPEN_HOME_MODIFY_STUDENT, assignId, openHomework});
        }
    }
}

export function fetchLeafChapters(ids) {
    return (dispatch, getState) => {
        return chapterService.fetchLeafChapters(ids).then(r => {
            let result = {topChapter: null, leafChapters: r};
            dispatch({type: FETCH_LEAF_CHAPTERS, result});
        })
    }
}

export function fetchOpenHomeworkCandidates(params) {
    return (dispatch, getState) => {
        return openHomeworkService.fetchOpenHomeworkCandidates(params).then(candidates => {

            setLevelCount(candidates);

            return Promise.all(candidates.units.map(resolveImage))
                .then(r => {
                    dispatch({type: FETCH_CANDIDATES, candidates: candidates});
                    return candidates;
                });
        })
    }
}

export function fetchLearningStats() {
    return async dispatch => {
        let learningStats = await learningService.fetchLearningStats();

        dispatch({type: FETCH_LEARNING_STATS, learningStats});
        return learningStats;
    }
}

export function fetchSchoolBooks(rootChapterId) {
    return async (dispatch, getState) => {
        let schoolBooks = await chapterService.fetchSchoolBooks(rootChapterId);
        dispatch({type: FETCH_SCHOOLBOOKS, schoolBooks});
    };
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


const ACTION_HANDLERS = {
    [FETCH_OPEN_HOMEWORKS]: produce((draft, action) => {
        draft.openHomeworks = [...action.openHomeworks].sort((a, b) => b.id - a.id);
        draft.pagedOpenHomeworks = action.pagedOpenHomeworks;
    }),
    [FETCH_MORE_OPEN_HOMEWORKS]: produce((draft, action) => {
        draft.openHomeworks = [...draft.openHomeworks, ...action.openHomeworks].sort((a, b) => b.id - a.id);
        draft.pagedOpenHomeworks = action.pagedOpenHomeworks;
        draft.page = action.page;
        draft.isPageEnd = action.page >= action.pagedOpenHomeworks.totalPages - 1;
    }),
    [CREATE_OPEN_HOMEWORK]: produce((draft, action) => {
        draft.openHomeworks = [action.openHomework.homeworkAssign, ...draft.openHomeworks];
    }),
    [DELETE_OPEN_HOMEWORK]: produce((draft, action) => {
        draft.openHomeworks = draft.openHomeworks.filter(openHomework => openHomework.id !== action.assignId);
    }),
    [SET_OPEN_HOMEWORK]: produce((draft, action) => {
        draft.openHomework = action.openHomework;
        if (action.leafChapters)
            draft.leafChapters = action.leafChapters;
    }),
    [SET_OPEN_HOMEWORK_LEARNING]: produce((draft, action) => {
        draft.learning = action.learning;
    }),
    [FETCH_OPEN_HOMEWORK_LEARNING]: produce((draft, action) => {
        draft.learning = action.learning;
        draft.learnings = draft.learnings.map(l => {
            if (l.id == action.learning.id) {
                return action.learning;
            }
            return l;
        })
    }),
    [FETCH_OPEN_HOMEWORK_LEARNINGS]: produce((draft, action) => {
        draft.learnings = action.learnings;
    }),
    [FETCH_CHAPTERS]: produce((draft, action) => {
        draft.chapters = action.result;
    }),
    [FETCH_LEAF_CHAPTERS]: produce((draft, action) => {
        draft.chapters = action.result;
    }),
    [FETCH_CANDIDATES]: produce((draft, action) => {
        draft.candidates = action.candidates;
    }),
    [OPEN_HOME_MODIFY_STUDENT]: produce((draft, action) => {
        draft.openHomeworks = draft.openHomeworks.map(homework => {
            if (homework.id === action.assignId)
                return action.openHomework;
            return homework;
        })
    }),
    [FETCH_LEARNING_STATS]: produce((draft, action) => {
        draft.learningStats = action.learningStats;
    }),
    [FETCH_SCHOOLBOOKS]: produce((draft, action) => {
        draft.schoolBooks = action.schoolBooks;
    })
};

const initialState = {
    openHomeworks: null,
    openHomework: null,
    chapters: null,
    candidates: null,
    leafChapters: null,
    learning: null,
    learnings: null,
    schoolBooks: null,
    page: 0,
    isPageEnd: false,
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
