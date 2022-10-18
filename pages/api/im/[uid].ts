import {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../../prisma';

export const config = {
    api: {
        externalResolver: true,
    },
}

// returns the image with the given id
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {uid} = req.query;


    if (req.method === 'POST') {
        // method not allowed
        res.status(405).json({error: 'method not allowed'});
    } else if (req.method === 'GET') {
        if (!uid) {
            res.status(400).json({error: 'pid is required'});
            return;
        } else {

            const id = parseInt(uid as string);
            if (isNaN(id)) {
                res.status(400).json({error: 'id is not a number'});
                return;
            }

            const image = await prisma.image.findUnique({
                where: {
                    id: id,
                },
            });

            if (!image) {
                res.status(400).json({error: 'image not found'});
                return;
            }
            const buffer = image.data;

            // expires in 7 days
            res.setHeader('Cache-Control', 'maxage=259200, stale-while-revalidate');

            // send image
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Content-Length', buffer.length);
            // res.status(200).send(buffer);
            res.end(buffer);
            return;
        }
    }

}
