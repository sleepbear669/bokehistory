import produce from "immer";
import remindLearningService from 'shared/service/remindLearningService';
import courseService from "../../../shared/service/courseService";
import moment from "moment/moment";

export const FETCH_COURSES = 'FETCH_COURSES';
export const CREATE_REMIND_LEARNING = 'CREATE_REMIND_LEARNING';
export const FETCH_REMIND_LEARNINGS = 'FETCH_REMIND_LEARNINGS';
export const FETCH_CANDIDATE_COUNT = 'FETCH_CANDIDATE_COUNT';
export const FETCH_REMIND_LEARNING_PREVIEW = 'FETCH_REMIND_LEARNING_PREVIEW';


export function fetchRemindLearnings() {
    return async dispatch => {
        let list = await remindLearningService.fetchRemindLearnings();
        dispatch({type: FETCH_REMIND_LEARNINGS, list});
        return list;
    }
}

export function fetchCandidateCount({
                                        studentIds,
                                        startDate,
                                        endDate
                                    }) {
    return async dispatch => {
        let candidateCounts = await Promise.all(
            studentIds.map(studentId => {
                return remindLearningService.fetchCandidateCount({
                    studentId,
                    start: startDate.toDate().getTime(),
                    end: endDate.toDate().getTime()
                }).then(candidateCounts => ({studentId, candidateCounts}));
            }));
        dispatch({type: FETCH_CANDIDATE_COUNT, candidateCounts});
        return candidateCounts;
    }
}

export function previewRemindLearning({
                                          studentId,
                                          learningTypes,
                                          levels,
                                          learningIds,
                                      }) {
    return async dispatch => {
        let result = await remindLearningService.previewRemindLearning({
            studentId,
            learningTypes,
            levels,
            learningIds,
        });
        dispatch({type: FETCH_REMIND_LEARNING_PREVIEW, result});
        return result;
    }
}

export function createRemindLearning({
                                         studentId,
                                         learningTypes,
                                         levels,
                                         learningIds,
                                     }) {
    return async dispatch => {
        let result = await remindLearningService.createRemindLearning({
            studentId,
            learningTypes,
            levels,
            learningIds,
        });
        dispatch({type: CREATE_REMIND_LEARNING, result});
        return result;
    }
}

export function fetchCourses() {
    return (dispatch, getState) => {
        return courseService.list().then(courses => {
            courses = courses.sortBy('createdDate').reverse();
            dispatch({type: FETCH_COURSES, courses});
            return courses;
        })
    };
}

function buildViewData({remindLearningsGroupByStudent, candidateCount, dateNumbers}) {
    if (remindLearningsGroupByStudent && candidateCount) {

        return Object.entries(remindLearningsGroupByStudent)
            .map(([studentId, remindLearnings]) => {
                let rows = [[]];
                remindLearnings.map(r => {
                    let candidateCountByStudent = candidateCount[r.student.id];
                    if (candidateCountByStudent) {
                        let learningResults = Object.entries(candidateCountByStudent)
                            .map(([dateNumber, learningResults]) => ({dateNumber, learningResults: learningResults.filter(l => r.referredLearningIds.includes(l.id))}))
                            .reduce((a, b) => {
                                a[b.dateNumber] = b.learningResults;
                                return a;
                            }, {});

                        Object.keys(learningResults).forEach(key => {
                            if (learningResults[key].length === 0) delete learningResults[key];
                        });
                        return {...r, learningResults}
                    } else {
                        return null;
                    }
                })
                    .filter(remindLearning => !!remindLearning)
                    .forEach(remindLearning => {
                        let size = calcSize(remindLearning, dateNumbers);
                        let row = findAppendableRow(rows, size, dateNumbers);
                        row.push(remindLearning);
                    });


                return {studentId: parseInt(studentId), rows}
            });
    }
}

const ACTION_HANDLERS = {
    [FETCH_REMIND_LEARNINGS]: produce((draft, action) => {
        draft.remindLearnings = action.list;
        draft.remindLearningsGroupByStudent = action.list.groupBy(r => r.student.id);
        draft.dateNumbers = Array(7).fill(0).map((_, i) => moment().subtract(i, 'days')).reverse().map(day => parseInt(day.format('YYYYMMDD')));
        draft.data = buildViewData(draft);
    }),
    [CREATE_REMIND_LEARNING]: produce((draft, action) => {
        draft.createResult = action.result;
        draft.dateNumbers = Array(7).fill(0).map((_, i) => moment().subtract(i, 'days')).reverse().map(day => parseInt(day.format('YYYYMMDD')));
        if (action.result.success) {
            draft.remindLearnings.push(action.result.learning);
            draft.remindLearningsGroupByStudent = draft.remindLearnings.groupBy(r => r.student.id);
            draft.data = buildViewData(draft);
        }
    }),
    [FETCH_REMIND_LEARNING_PREVIEW]: produce((draft, action) => {
        draft.preview = action.result;
    }),
    [FETCH_CANDIDATE_COUNT]: produce((draft, action) => {
        draft.candidateCount = {};
        action.candidateCounts.forEach(candidateCounts => {
            draft.candidateCount[candidateCounts.studentId] = candidateCounts.candidateCounts;
        });
        draft.dateNumbers = Array(7).fill(0).map((_, i) => moment().subtract(i, 'days')).reverse().map(day => parseInt(day.format('YYYYMMDD')));
        draft.data = buildViewData(draft);
    }),
    [FETCH_COURSES]: produce((draft, action) => {
        let courses = action.courses;
        draft.courses = courses;
        draft.coursesAsOption = courses.map(course => {
            return {
                label: course.title,
                value: course
            }
        })
    }),
};

const initialState = {};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}

function findAppendableRow(rows, size, dateNumbers) {
    let row = rows.find(row => isAppendable(row, size, dateNumbers));
    if (row) return row;

    row = [];
    rows.push(row);
    return row;
}

function calcSize(r, dateNumbers) {
    let numbers = Object.keys(r.learningResults).map(d => parseInt(d));

    let minValue = numbers.minValue();
    let maxValue = numbers.maxValue();

    if (minValue && maxValue) {
        let width = moment(`${maxValue}`).diff(moment(`${minValue}`), 'days') + 1;

        let index = Math.max(0, dateNumbers.indexOf(numbers.minValue()));
        return {width, index};
    }
    return {width: 0, index: 0};
}

function isAppendable(row, size, dateNumbers) {
    if (row.length === 0) return true;
    let space = toSpace(row, dateNumbers);
    if (space[size.index] === 0) {
        let slice = space.slice(size.index, size.index + size.width);
        if (slice.length === size.width && slice.every(e => e === 0))
            return true;
    }
    return false;
}

function toSpace(row, dateNumbers) {
    let space = dateNumbers.map(e => 0);
    row.forEach(l => {
        let size = calcSize(l, dateNumbers);
        for (let i = 0; i < size.width; i++)
            space[i + size.index] += 1;
    });
    return space;
}
