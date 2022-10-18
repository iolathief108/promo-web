import {NextApiRequest, NextApiResponse} from 'next';
import {getSession} from '../../../lib/session';
import {prisma} from '../../../prisma';
import multer from 'multer';
import {runMiddleware} from '../../../lib/middle';
import {File} from '../../../types';


// noinspection JSUnusedGlobalSymbols
export const config = {
    api: {
        bodyParser: false,
    },
};
export default async (req: NextApiRequest & {file: File;}, res: NextApiResponse) => {

    if (req.method === 'POST') {

        // create category in database
        const session = await getSession(req, res);

        // check if user is admin
        if (!session.isAdmin) {
            res.status(400).json({error: 'you are not admin'});
            return;
        }

        const storage = multer.memoryStorage();
        const upload = multer({storage: storage});
        await runMiddleware(req, res, upload.single('image'));

        const file = req?.file;

        let {
            name,
            slug,
            id,
            deleteId,
        } = req.body;

        id = id ? JSON.parse(id).value : undefined;
        deleteId = deleteId ? JSON.parse(deleteId).value : undefined;


        if (typeof deleteId === 'number') {

            // check if there is a products with this category
            const products = await prisma.product.findMany({
                where: {
                    category: {
                        id: deleteId,
                    },
                },
                select: {
                    id: true,
                },
            });

            if (products.length > 0) {
                res.status(400).json({error: 'there are products with this category'});
            } else {
                await prisma.category.delete({where: {id: deleteId}});
                res.status(200).json({success: true});
            }
            return;
        }

        // verify
        if (!name || !slug) {
            res.status(400).json({error: 'name and slug are required'});
            return;
        }

        if (typeof id === 'number') {
            // update category
            await prisma.category.update({
                where: {id},
                data: {
                    name: name,
                    slug,
                    image: file ? {
                        upsert: {
                            update: {
                                data: file.buffer
                            },
                            create: {
                                data: file.buffer
                            }
                        }
                    } : undefined,
                },
            });
            res.status(200).json({message: 'category updated'});
        } else {

            if (!file) {
                res.status(400).json({error: 'no file'});
                return;
            }

            const category = await prisma.category.create({
                data: {
                    name: name,
                    slug,
                    image: {
                        create: {
                            data: file.buffer,
                        }
                    }
                },
            });
            res.status(200).json({category});
        }

    } else {
        // list all categories
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: {
                        products: true
                    }
                },
                image: {
                    select: {
                        id: true
                    }
                }
            }
        });
        res.status(200).json({categories});
    }
}
