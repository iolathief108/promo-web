import {sendNativeSms} from './index';
import {makePin} from '../lib/make-id';
import {limitedPush, getTimeDiffFromNow} from './utils';
import {isValidateSMS} from '../lib/config';


async function _sendOtp(phone: string, pin: string): Promise<boolean> {
    return sendNativeSms(phone, 'Your OTP code for NeatKitch Login is ' + pin);
}

export type OtpDoc = {
    OTPs: {
        otp: string;
        timeGenerated: Date;
    }[];
    phone: string;
    otpSendCount: number
    failCount: number;
};


let otpDocs: OtpDoc[] = [];
let cleanPending = false;
const maxAttempt = 15;
const otpMaxMin = 10;
const otpDocClearingTimeMin = 30;
const maximumOtpResendCount = 12;

function _getOtpDoc(phone: string) {
    for (const value of otpDocs) {
        if (value.phone === phone) {
            return value;
        }
    }
    let doc: OtpDoc = {
        OTPs: [],
        failCount: 0,
        phone: phone,
        otpSendCount: 0,
    };
    otpDocs.push(doc);
    return doc;
}

function _clean() {

    const theClean = () => {
        let removeIndexes: number[] = [];
        for (let i = 0; i < otpDocs.length; i++) {
            const doc = otpDocs[i];
            for (const otp of doc.OTPs) {

                let docClearedCount = 0;
                if (getTimeDiffFromNow(otp.timeGenerated, 'minute') > otpDocClearingTimeMin) {
                    docClearedCount++;
                }

                if (docClearedCount > 3) {
                    removeIndexes.push(i);
                }
            }
        }
        removeIndexes.forEach(v => {
            otpDocs.splice(v, 1);
        });
        cleanPending = false;
    };

    if (!cleanPending) {
        cleanPending = true;
        setTimeout(theClean, 1000 * 60 * 60);
    }
}

/**
 * @param phone should be in standard format
 */
export async function sendOTP(phone: string): Promise<boolean> {
    _clean();
    let value = _getOtpDoc(phone);

    if (value.otpSendCount > maximumOtpResendCount) {
        return false;
    }
    value.otpSendCount = value.otpSendCount + 1;
    const generatedOTP = String(makePin(6));
    limitedPush(
        value.OTPs,
        {otp: generatedOTP, timeGenerated: new Date()},
        3,
    );
    return await _sendOtp(value.phone, value.OTPs[value.OTPs.length - 1].otp);
}


// todo: should check the time
export function verifyOTP(phone: string, otp: string): boolean {
    // if (isDevelopment) {
    //     return true;
    // }

    if (!isValidateSMS) {
        return true;
    }

    for (let i = 0; i < otpDocs.length; i++) {
        const value = otpDocs[i];
        if (value.phone === phone) {
            const success = !!value.OTPs.find(item => item.otp === otp && getTimeDiffFromNow(item.timeGenerated, 'minute') <= otpMaxMin);
            if (!success) {
                value.failCount++;
            }
            if (success && value.failCount < maxAttempt) {
                otpDocs.splice(i, 1);
                return true;
            }
            return false;
        }
    }
    return false;
}
