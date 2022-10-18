import {NextApiRequest, NextApiResponse} from 'next';
import {getSession} from '../../../lib/session';
import {prisma} from '../../../prisma';


export default async (req: NextApiRequest, res: NextApiResponse) => {

    if (!verifyRequest(req, res) || !await verifyAuth(req, res)) {
        return;
    }

    const id = await verifyId(req, res);
    if (!id) {
        return;
    }

    // delete product
    await prisma.product.delete({
        where: {
            id: id
        },
    });

    res.status(200).json({
        message: 'Order deleted',
    });

}



function verifyRequest(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'GET') {
        res.status(405).json({
            error: 'Method not allowed',
        });
        return false;
    }
    return true;
}

async function verifyAuth(req: NextApiRequest, res: NextApiResponse) {
    await getSession(req, res);
    // @ts-ignore
    if (!req?.session?.isAdmin) {
        res.status(401).json({message: 'Unauthorized'});
        return false;
    }
    return true;
}

async function verifyId( req: NextApiRequest, res: NextApiResponse) {
    const {id} = req.query;
    if (!id) {
        res.status(400).json({message: 'Missing id'});
        return false;
    }
    // if id is array, only one id is allowed
    if (Array.isArray(id)) {
        res.status(400).json({message: 'Too many ids'});
        return false;
    }
    // if id is string, convert to number
    if (typeof id === 'string') {
        const idNum = parseInt(id);
        if (isNaN(idNum)) {
            res.status(400).json({message: 'Invalid id'});
            return false;
        }
        return idNum;
    }
    return id;
}
