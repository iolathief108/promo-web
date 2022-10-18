import {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../prisma';


export default async (req: NextApiRequest, res: NextApiResponse) => {


    if (req.method === 'GET') {
        const {query} = req;
        let {pid} = query;

        if (Array.isArray(pid)) {
            pid = pid[0];
        }

        // if string is number, convert to number
        let id: number | undefined;
        if (typeof pid === 'string') {
            id = parseInt(pid);
        }

        if (typeof id === 'number') {
            const product = await prisma.product.findUnique({
                where: {
                    id,
                },
            });
            if (product) {
                res.status(200).json(product);
            } else {
                res.status(404).end();
            }
        }
    }

    res.status(405).end();
}
