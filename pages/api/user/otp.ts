import {NextApiRequest, NextApiResponse} from 'next';
import {sendOTP} from '../../../sms/otp';
import {validatePhone} from '../../../lib/validators';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method === 'POST') {
        const {key, phone} = req.body;
        if (key === 'send_otp' && phone && validatePhone(phone)) {
            const success = await sendOTP(phone);
            res.status(200).json({success});
        } else {
            res.status(400).json({error: 'Please provide a valid phone number'});
        }
    } else {
        res.status(400).json({error: 'invalid request'});
    }
}
