import produce from 'immer';

import gameService from './../shared/services/gameService';
import ratingService from './../shared/services/ratingService';

export const FETCH_GAMES = 'FETCH_GAMES';
export const SELECT_GAME = 'SELECT_GAME';
export const RESET_GAME = 'RESET_GAME';

const clans = [{name: '아르카디안 커뮤니티'},
    {name: '리사이클론'},
    {name: '스플라이스 택티컬 지노믹스'},
    {name: '리플리코돈'},
    {name: '블랙샌드 캐틀 컴퍼니'},
    {name: '구글 스페이스'},
    {name: '호텔 포시즌'},
    {name: '이오레 ( 해양연구사업기구 )'},
    {name: '파란태양'},
    {name: '베르메스 중금속'},
    {name: '마스티프 시큐리티'},
    {name: '테슬라 스페이스X'},
    {name: '아시모프 파운데이션'},
    {name: '스틱스 화성지구 해양회사'},
    {name: '로스차일드'},
    {name: '유니세프'},
    {name: '미스캐토닉대학'},
    {name: '페덱스 코스모'},
    {name: '제너럴 일렉트릭'},
    {name: '프로메테우스'},
    {name: '블라도프 방산그룹'},
    {name: '진테키 바이오틱스'},
    {name: '헬리온'},
    {name: '타르시스 공화국'},
    {name: '테락터'},
    {name: '포보로그'},
    {name: '토르게이트'},
    {name: '크레디코'},
    {name: '유나이티드 네이션즈 마스 이니셔티브'},
    {name: '에코라인'},
    {name: '마이닝 길드'},
    {name: '인벤트릭스'},
    {name: '새턴 시스템즈'},
    {name: '인더플랜트레이 시네마틱스'},
    {name: '로빈슨 인더스트리즈'},
    {name: '벨리 트러스트'},
    {name: '비터'},
    {name: '포인트 루나'},
    {name: '화성 장벽(췅싱 마스)'},
    {name: '폴리페모스'},
    {name: '아리도르'},
    {name: '스톰크래프트'},
    {name: '포세이돈'},
    {name: '아크라이트'},
    {name: '바이론'},
    {name: '메뉴테크'},
    {name: '셀레스틱'},
    {name: '아프로디테'},
    {name: '모닝스타 인더스트리'}];


export function fetchGames() {
    return async (dispatch) => {
        const games = await gameService.fetchGames();
        // gameService.updateClan('terraforming_mars', clans);
        dispatch({type: FETCH_GAMES, games});
    }
}

export function selectGame(gameName) {
    return {type: SELECT_GAME, gameName}
}

export function resetGame() {
    return {type: RESET_GAME}
}

const ACTION_HANDLERS = {
    [FETCH_GAMES]: produce((draft, action) => {
        draft.games = action.games;
    }),
    [SELECT_GAME]: produce((draft, action) => {
        draft.game = draft.games.find(g => g.originalName === action.gameName);
    }),
    [RESET_GAME]: produce((draft, action) => {
        draft.game = null;
    }),
};

const initialState = {
    games: [],
    game: null
};

export default (state = initialState, action) => {
    const handler = ACTION_HANDLERS[action.type];
    return handler ? handler(state, action) : state;
}
