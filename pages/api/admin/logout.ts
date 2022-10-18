import type {NextApiRequest, NextApiResponse} from 'next';
import {getSession} from '../../../lib/session';


//logout user from session
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    await getSession(req, res);
    if (req.method === 'GET') {
        //check if user is logged in
        if (!req.session.isAdmin) {
            res.status(400).json({error: 'admin is not logged in'});
            return;
        }
        //delete session
        req.session.destroy();
        res.status(200).json({success: true});
    } else {
        res.status(400).json({error: 'method not allowed'});
    }
}
