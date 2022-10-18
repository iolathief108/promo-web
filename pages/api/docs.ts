import {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../prisma';


export default async (req: NextApiRequest & {files: any;}, res: NextApiResponse) => {
    if (req.method === 'GET') {

        const documents = await prisma.document.findMany();
        res.status(200).json({
            docs: documents.map(doc => ({
                key: doc.key,
                value: JSON.parse(doc.value).value,
            })),
            cats: await prisma.category.findMany(),
        });
    }
}
