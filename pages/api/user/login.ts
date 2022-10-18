import {NextApiRequest, NextApiResponse} from 'next';
import {getSession} from '../../../lib/session';
import {validatePhone} from '../../../lib/validators';
import {verifyOTP} from '../../../sms/otp';
import {User} from '@prisma/client';
import {prisma} from '../../../prisma';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {

    // initialize session
    const session = await getSession(req, res);

    if (req.method === 'POST') {
        //check name and otp in body
        const phone = req.body.phone;
        const otp = req.body.otp;

        if (!phone || !otp) {
            res.status(400).json({error: 'name and otp are required'});
            return;
        }

        //check if phone is correct
        if (!validatePhone(phone)) {
            res.status(400).json({error: 'You must enter a valid phone number'});
            return;
        }

        //check if otp is correct
        if (!verifyOTP(phone, otp)) {
            res.status(400).json({error: 'Invalid OTP, please try again'});
            return;
        }

        // get or create user
        let user: User | null;
        user = await prisma.user.findUnique({
            where: {
                phone,
            },
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    phone,
                },
            });
        }

        // set session
        session.userId = user.id;

        res.status(200).json({success: true});

    } else if (req.method === 'GET') {
        if (typeof req.session.userId === 'number') {
            res.status(200).json({user: true});
        } else {
            res.status(400).json(false);
        }
    }
}
