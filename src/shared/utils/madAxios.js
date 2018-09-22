import axios from 'axios';
import {setItem, getItem} from 'shared/localStorageHelper';
import loginService from 'shared/service/loginService';

const API_BASE_URL = SERVICE_URL;
const HEADER_STRING = 'Authorization';

const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
});

const toFormParams = (obj) => {
    return Object.keys(obj).map(key => key + '=' + encodeURIComponent(obj[key])).join('&');
};

const CONTENT_TYPE_TEXT_PLAIN_CONFIG = {
    headers: {
        'Content-Type': 'text/plain'
    }
};

if (getItem('access_token'))
    setToken(getItem('access_token'));

function setToken(token) {
    if (token)
        instance.defaults.headers.common[HEADER_STRING] = addTokenPrefix(token);
}

function addTokenPrefix(rawToken) {
    return 'Bearer ' + rawToken;
}

const toFormFileData = (file, data) => {
    let fd = new FormData();
    if (file) fd.append('file', file);
    if (data)
        fd.append('json',
            new Blob([JSON.stringify(data)], {type: 'application/json'}));

    return fd;
};

const postMultipartHeader = () => {
    return {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    }
};

const postJsonHeader = () => {
    return {
        headers: {
            Accept: 'application/json, */*',
            'Content-Type': 'application/json',
        }
    }
};

const toJson = r => {
    return r.data;
};

const postFormHeader = () => {
    return {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    }
};

const toJsonData = data => {
    return JSON.stringify(data);
};

function tokenAutoRefresh(ajaxPromise) {
    return new Promise((resolve, reject) => {
        ajaxPromise.then(d => {
            resolve(d);
        }).catch(e => {
            if (e.response) {
                if (e.response.status === 401) {
                    if (loginService.isAccessTokenExpired()) {
                        loginService.refreshToken().then(tokens => {
                            setItem('access_token', tokens.token);
                            setToken(tokens.token);
                            e.response.config.headers.Authorization = addTokenPrefix(tokens.token);

                            instance.request(e.response.config).then(toJson).then(json => resolve(json));

                            if (loginService.needToRefreshToken()) {
                                loginService.refreshRefreshToken().then(refreshToken => {
                                    setItem('refresh_token', refreshToken.token);

                                    loginService.refreshToken().then(tokens => {
                                        let newAccessToken = tokens.token;

                                        setToken(newAccessToken);
                                        setItem('access_token', newAccessToken);
                                    }).catch(e => {
                                        loginService.logout(reject, e);
                                    });
                                }).catch(e => {
                                    loginService.logout(reject, e);
                                });
                            }
                        }).catch(err => {
                            if (loginService.needToRefreshToken()) {
                                loginService.refreshRefreshToken().then(refreshToken => {
                                    setItem('refresh_token', refreshToken.token);

                                    loginService.refreshToken().then(tokens => {
                                        let newAccessToken = tokens.token;

                                        setToken(newAccessToken);
                                        setItem('access_token', newAccessToken);

                                        e.response.config.headers.Authorization = addTokenPrefix(tokens.token);

                                        instance.request(e.response.config).then(toJson).then(json => resolve(json));
                                    }).catch(err => {
                                        loginService.logout(reject, err);
                                    });
                                }).catch(err => {
                                    loginService.logout(reject, err);
                                });
                            } else {
                                loginService.logout(reject, err);
                            }

                            return reject(err);
                        });
                    } else {
                        loginService.logout(reject);
                        return reject(e);
                    }
                } else {
                    return reject(e);
                }
            } else {
                return reject(e);
            }
        });
    });
}

const madAxios = {
    getResponse: (url, config) => {
        return tokenAutoRefresh(instance.get(url, config));
    },
    get: (url, params) => {
        return tokenAutoRefresh(instance.get(url, {params}).then(toJson));
    },
    post: url => {
        return tokenAutoRefresh(instance.post(url));
    },
    postData: (url, data) => {
        return tokenAutoRefresh(instance.post(url, data).then(toJson));
    },
    postText: (url, data) => {
        return tokenAutoRefresh(instance.post(url, data, CONTENT_TYPE_TEXT_PLAIN_CONFIG).then(toJson));
    },
    postMultipartForm: (url, data) => {
        return tokenAutoRefresh(instance.post(url, data, postMultipartHeader()).then(toJson));
    },
    postForm: (url, data) => {
        return tokenAutoRefresh(instance.post(url, toFormParams(data), postFormHeader()).then(toJson));
    },
    postFile: (url, file, data) => {
        return tokenAutoRefresh(instance.post(url, toFormFileData(file, data)).then(toJson));
    },
    deleteData: (url, data) => {
        return tokenAutoRefresh(instance.delete(url, {data}).then(toJson));
    },
    putData: (url, data) => {
        return tokenAutoRefresh(instance.put(url, data).then(toJson));
    },
    put: url => {
        return tokenAutoRefresh(instance.put(url).then(toJson));
    },
    delete: url => {
        return tokenAutoRefresh(instance.delete(url).then(toJson));
    },
    all: calls => {
        return axios.all(calls);
    },
    spread: callback => {
        return axios.spread(callback);
    },
    cachedGet: (url, params) => {
        if (cache[url]) return Promise.resolve(cache[url]);
        return madAxios.get(url, params).then(r => {
            cache[url] = r;
            return r
        });
    }
};

const cache = {};

export {madAxios, setToken}
