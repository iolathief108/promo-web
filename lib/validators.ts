import {isStaging, mobilePrefix} from './config';


export function validatePhone(phone: string) {

    if (isStaging) {
        return true;
    }
    function isNumeric(str: string) {
        if (typeof str != "string") return false;
        return !isNaN(str as any) && !isNaN(parseFloat(str));
    }

    if (!phone?.startsWith(mobilePrefix)) return false;

    phone = phone.replace(mobilePrefix, '');

    if (!isNumeric(phone)) return false;

    if (phone.includes(".")) return false;

    if (Number(phone) < 0) return false;

    if (!validateStandardSingaporePhone(mobilePrefix + phone)) return false;

    return true;
}

export function validatePassword(password: string) {
    const passwordPattern = /^[A-Za-z\.\)\(\*\&\^\%\$\#\@\!\[\]\{\}\-\_\=\+\?<>0-9~]{8,16}$/;
    return !!password?.match(passwordPattern);
}

export function validateZip(zip: string) {
    if (isStaging) {
        return true;
    }
    const zipPattern = /^[0-9]{5}$/;
    return !!zip?.match(zipPattern);
}

export const validateStandardSingaporePhone = (phone: string) => {
    if (isStaging) {
        return true;
    }
    const phonePattern = /^\+65[689]\d{7}$/g;
    return !!phone?.match(phonePattern);
}

export const validateEmail = (email: string) => {
    const emailPattern = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return !!email?.match(emailPattern);
}
