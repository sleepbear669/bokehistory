class TempStorage {
    constructor() {
        this.storage = {};
    }

    getItem = key => this.storage.hasOwnProperty(key) ? this.storage[key] : null;

    setItem = (key, value) => this.storage[key] = JSON.stringify(value);

    removeItem = (key) => {
        if (this.storage.hasOwnProperty(key)) {
            this.storage[key] = '';
        }
    }
}

const tempStorage = new TempStorage();

function getItem(key) {
    key = getKey(key);

    if (sessionStorage != null) {
        try {
            return JSON.parse(sessionStorage.getItem(key));
        } catch (e) {
            return sessionStorage.getItem(key);
        }
    } else {
        try {
            return JSON.parse(tempStorage.getItem(key));
        } catch (e) {
            return tempStorage.getItem(key);
        }
    }
}

function setItem(key, value) {
    key = getKey(key);
    if (sessionStorage != null) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            sessionStorage.clear();
            sessionStorage.setItem(key, JSON.stringify(value));
        }
    } else {
        tempStorage.setItem(key, value);
    }
}

function removeItem(key) {
    if (sessionStorage != null) {
        sessionStorage.removeItem(getKey(key));
    } else {
        tempStorage.removeItem(key);
    }
}

function getKey(key) {
    // var user = dataStoreService.get('user');
    // console.log(user);
    // if (user) return key + ":" + user.id;
    return key + ':user:';
}

export {getItem, setItem, removeItem};