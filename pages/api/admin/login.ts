import type {NextApiRequest, NextApiResponse} from 'next';
import {getSession} from '../../../lib/session';
import {isDevelopment, isProduction, isStaging} from '../../../lib/config';


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {

    // initialize session
    await getSession(req, res);

    if (req.method === 'POST') {
        //check name and password in body
        const username = req.body.username || 'user';
        const password = req.body.password;

        if (!username || !password) {
            res.status(400).json({error: 'name and password are required'});
            return;
        }

        //check if username is correct
        if (username !== 'user') {
            res.status(400).json({error: 'username is incorrect'});
            return;
        }

        //check if password is correct
        if (isProduction) {
            if (password !== 'tchureamicen') {
                res.status(400).json({error: 'password is incorrect'});
                return;
            }
        }

        //create session
        req.session.isAdmin = true;
        res.status(200).json({success: true});
    } else if (req.method === 'GET') {
        if (req.session.isAdmin) {
            res.status(200).json({admin: true});
        } else {
            res.status(400).json(false);
        }
    }
}
