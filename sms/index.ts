import axios from "axios";
import {isDevelopment, isForceSMS, mobilePrefix} from '../lib/config';

/**
 *
 * @param phone phone number - should be in standard format (+65xxxxxxxx)
 * @param sms sms to be send
 * @returns status of success
 */
export async function sendNativeSms(phone: string, sms: string): Promise<boolean> {
    /*
    * force any -> false   OK
    * !force (dev || test) -> true OK
    * */

    console.log(`sendNativeSms: ${phone} ${sms}`);
    if (!isForceSMS && (isDevelopment)) {
        console.info(sms);
        return true;
    }

    if (!isForceSMS) {
        return true;
    }

    if (!phone.startsWith(mobilePrefix)) {
        return false;
    }

    // todo: user_id & api_key & sender_id
    const response = await axios.get("https://smsgateway.com/api/", {
        params: {
            user_id: "1234",
            api_key: "api_key",
            sender_id: "NeatKitch",
            to: phone,
            message: sms,
        },
    });

    //@ts-ignore
    return response.status === 200 && response.data.status === "success";
}
