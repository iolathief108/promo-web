import {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../../prisma';
import {getSession} from '../../../lib/session';
import {verifyOTP} from '../../../sms/otp';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    const session = await getSession(req, res);

    // get user profile
    if (req.method === 'GET') {
        // get user profile
        if (req.session.userId) {
            const user = await prisma.user.findUnique({
                where: {
                    id: req.session.userId,
                }
            });
            if (user) {
                res.status(200).json({
                    user: {
                        id: user.id,
                        phone: user.phone,
                        firstName: user.firstName,
                        lastName: user.lastName,
                    }
                });
            } else {
                res.status(404).json({
                    error: 'User not found',
                });
            }
        } else {
            res.status(401).json({
                error: 'User not logged in',
            });
        }
    } else if (req.method === 'POST') {
        // update user profile
        if (req.session.userId) {
            const {firstName, lastName, phone, otp} = req.body;

            if (phone) {
                if (firstName || lastName) {
                    res.status(400).json({
                        error: 'Cannot update phone and firstName/lastName at the same time',
                    });
                    return;
                }

                if (!otp) {
                    res.status(400).json({
                        error: 'OTP is required',
                    });
                    return;
                }
                // check otp
                if (!verifyOTP(phone, otp)) {
                    res.status(400).json({
                        error: 'OTP is invalid',
                    });
                    return;
                }
                const user = await prisma.user.update({
                    where: {
                        id: req.session.userId,
                    },
                    data: {
                        phone: phone,
                    }
                });
                if (user) {
                    res.status(200).json({
                        success: true,
                    });
                } else {
                    res.status(404).json({
                        error: 'User not found',
                    });
                }
                return;
            } else if (firstName || lastName) {
                const user = await prisma.user.update({
                    where: {
                        id: req.session.userId,
                    },
                    data: {
                        firstName,
                        lastName,
                    }
                });
                if (user) {
                    res.status(200).json({
                        user: {
                            id: user.id,
                            firstName: user.firstName,
                            lastName: user.lastName,
                        }
                    });
                } else {
                    res.status(404).json({
                        error: 'User not found',
                    });
                }
            } else {
                res.status(400).json({
                    error: 'phone or firstName/lastName is required',
                });
                return;
            }

        } else {
            res.status(401).json({
                error: 'User not logged in',
            });
        }
    }
}
