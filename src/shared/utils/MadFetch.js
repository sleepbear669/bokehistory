// import {API_BASE_URL} from './../config';

const API_BASE_URL = 'http://localhost:5000';

const GET_REQUEST = {
    method: 'GET',
    credentials: 'include'
};

const POST_REQUEST = {
    method: 'POST',
    credentials: 'include'
};
const PUT_REQUEST = {
    method: 'PUT',
    credentials: 'include'
};


const METHOD_TYPE = {
    GET: GET_REQUEST,
    POST: POST_REQUEST,
    PUT: PUT_REQUEST
};

const toFormParams = (obj) => {
    return Object.keys(obj).map(key => key + '=' + encodeURIComponent(obj[key])).join('&');
};

const toFormData = (file, data) => {
    let fd = new FormData();
    if (file) fd.append('file', file);
    if (data)
        fd.append('json',
            new Blob([JSON.stringify(data)], {type: "application/json"}));

    return fd;
};

const httpObject = (method, param) => ({
    ...METHOD_TYPE[method],
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: toFormParams(param)
});

const httpMultipartForm = (method, file, data) => ({
    ...METHOD_TYPE[method],
    headers: {
        // 'Content-Type': undefined
    },
    body: toFormData(file, data)

});

const httpData = (method, data) => ({
    ...METHOD_TYPE[method],
    headers: {
        Accept: 'application/json, */*',
        'Content-Type': 'application/json'
    },
    body : JSON.stringify(data)
});

export const toJson = (d) => d.json();


class MadFetch {

    _fetchWrapper(url, config) {
        return fetch(url, config)
            .then(r => {
                const contentType = r.headers.get("content-type");
                if ((contentType && contentType.indexOf("application/json") === -1) || r.url.endsWith('.html')) {
                    return Promise.reject('wrong data type error');
                }
                return r;
            })
            .then(toJson)
            .catch(e => {
                console.log(e);
            });
    };

    get(url) {
        return this._fetchWrapper(API_BASE_URL + url, GET_REQUEST);
    }

    post(url) {
        return this._fetchWrapper(API_BASE_URL + url, POST_REQUEST);
    }

    postForm(url, data) {
        return this._fetchWrapper(API_BASE_URL + url, httpObject('POST', data));
    }

    postData(url, data) {
        return this._fetchWrapper(API_BASE_URL + url, httpData('POST', data));
    }

    postWithFile(url, file, data) {
        return this._fetchWrapper(API_BASE_URL + url, httpMultipartForm('POST', file, data));
    }
}

export const madFetch = new MadFetch();
