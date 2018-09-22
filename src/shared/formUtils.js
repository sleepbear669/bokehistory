export const FORM_TYPE = {
    TEL: {
        pattern: /^\d{2,3}-\d{3,4}-\d{4}$/,
        placeholder: "000-0000-0000"
    },
    CELLPHONE: {
        pattern: /^01(?:0|1|[6-9])-\d{3,4}-\d{4}$/,
        placeholder: "010-0000-0000"
    },
    EMAIL: {
        pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        placeholder: "sample@matholic.net"
    },
    CARD_NUMBER: {
        pattern: /^\d{4}-\d{4}-\d{4}-\d{4}$/,
        placeholder: "0000-0000-0000-0000"
    },
    CARD_EXPIRATION_MONTH: {
        pattern: /^([0]\d|[1][0-2])$/,
        placeholder: "00"
    },
    CARD_EXPIRATION_YEAR: {
        pattern: /^([1][7-9]|[2-9]\d)$/,
        placeholder: "00"
    },
    BIRTHDAY: {
        pattern: /^(\d{6})$/,
        placeholder: "000000"
    },
    CORPORATION_NUMBER: {
        pattern: /^(\d{6}-\d{7})$/,
        placeholder: "000000-0000000"
    },
    BUSINESS_NUMBER: {
        pattern: /^(\d{3}-\d{2}-\d{5})$/,
        placeholder: "000-00-00000"
    }

};

function toPhoneNumberFormat(v) {
    if (v) {
        let rv = v.replace(/-/g, '');
        if (rv.length === 11) {
            return `${rv.substr(0, 3)}-${rv.substr(3, 4)}-${rv.substr(7, 4)}`;
        } else if (rv.length === 10) {
            if (rv.startsWith('02'))
                return `${rv.substr(0, 2)}-${rv.substr(2, 4)}-${rv.substr(6, 4)}`;
            return `${rv.substr(0, 3)}-${rv.substr(3, 3)}-${rv.substr(6, 4)}`;
        } else if (rv.length === 9) {
            return `${rv.substr(0, 2)}-${rv.substr(2, 3)}-${rv.substr(5, 4)}`;
        }
    }
    return v;
}

function checkPhoneNumber(phoneNumber, pattern) {
    if (phoneNumber) {
        return pattern.test(phoneNumber);
    }
    return false;
}

function checkPasswordLength(newPassword) {
    if (newPassword !== "")
        return newPassword.length < 6;
    return false;
}

function checkPasswordUnequal(newPassword, checkPassword) {
    if (newPassword !== "" && checkPassword !== "")
        return newPassword !== checkPassword;
}

function checkEmail(email) {
    if (email) {
        let pattern = new RegExp(FORM_TYPE.EMAIL.pattern);
        return pattern.test(email);
    }
    return false;
}

function checkBusinessNumber(val) {
    if (val) {
        let pattern = new RegExp(FORM_TYPE.BUSINESS_NUMBER.pattern);
        return pattern.test(val);
    }
    return false;
}

function checkCorporateNumber(val) {
    if (val) {
        let pattern = new RegExp(FORM_TYPE.CORPORATION_NUMBER.pattern);
        return pattern.test(val);
    }
    return false;
}


function checkBirthDay(val) {
    if (val) {
        let pattern = new RegExp(FORM_TYPE.BIRTHDAY.pattern);
        return pattern.test(val);
    }
    return false;
}

export default {
    toPhoneNumberFormat,
    checkPhoneNumber,
    checkPasswordLength,
    checkPasswordUnequal,
    checkEmail,
    checkCorporateNumber,
    checkBusinessNumber,
    checkBirthDay
};
