import {getSession} from '../../../lib/session';
import {prisma} from '../../../prisma';
import {NextApiRequest, NextApiResponse} from 'next';
import multer from 'multer';
import {runMiddleware} from '../../../lib/middle';


// noinspection JSUnusedGlobalSymbols
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async (req: NextApiRequest & {file: any;}, res: NextApiResponse) => {
    const session = await getSession(req, res);

    const storage = multer.memoryStorage();
    const upload = multer({storage: storage});
    await runMiddleware(req, res, upload.single('image'));

    const file = req?.file;

    //check if user is admin
    if (!session.isAdmin) {
        res.status(400).json({error: 'you are not admin'});
        return;
    }

    if (req.method === 'POST') {
        let {
            name,
            variant1InStock,
            variant1Name,
            variant1Price,
            variant1Qty,
            variant2InStock,
            variant2Name,
            variant2Price,
            variant2Qty,
            categoryId,
            description,
            enabled,
            pid,
        } = req.body;

        name = JSON.parse(name).value;
        variant1Name = JSON.parse(variant1Name).value;
        variant2Name = JSON.parse(variant2Name).value;
        variant1Price = JSON.parse(variant1Price).value;
        variant2Price = JSON.parse(variant2Price).value;
        variant1InStock = JSON.parse(variant1InStock).value;
        variant2InStock = JSON.parse(variant2InStock).value;
        variant1Qty =  JSON.parse(variant1Qty).value;
        variant2Qty =  JSON.parse(variant2Qty).value;
        description = JSON.parse(description).value;
        enabled = JSON.parse(enabled).value;
        categoryId = JSON.parse(categoryId).value;
        pid = pid ? JSON.parse(pid).value : undefined;

        if (pid === undefined && !file) {
            res.status(400).json({error: 'pid or image is required'});
            return;
        }

        if (
            !name ||
            // !variant1Name ||
            // !variant2Name ||
            // variant1Price === undefined ||
            // variant2Price === undefined ||
            // variant1InStock === undefined ||
            // variant2InStock === undefined ||
            // variant1Qty === undefined ||
            // variant2Qty === undefined ||
            categoryId === undefined ||
            enabled === undefined ||
            description === undefined
        ) {
            res.status(400).json({error: 'Please fill all fields'});
            return;
        }

        // last image of database
        const lastImage = await prisma.image.findFirst({
            orderBy: {
                id: 'desc',
            },
            select: {
                id: true,
            },
        });
        let theNewId: number = 0;
        if (lastImage && lastImage.id < 1239) {
            theNewId = Math.floor(Math.random() * 1000) + 999;
        } else if (lastImage && lastImage.id >= 1239) {
            theNewId = lastImage.id + 1;
        }

        if (pid) {
            // update product
            await prisma.product.update({
                where: {
                    id: pid,
                },
                data: {
                    name: name,
                    variant1InStock,
                    variant1Name,
                    variant1Price,
                    variant1Qty,
                    variant2InStock,
                    variant2Name,
                    variant2Price,
                    variant2Qty,
                    categoryId,
                    description,
                    enabled,
                },
            });
            // update image if there is a file
            // get id of image
            const imageId = (await prisma.product.findUnique({
                where: {
                    id: pid,
                },
                select: {
                    imageId: true,
                },
            }))?.imageId;
            if (file && imageId) {
                await prisma.image.update({
                    where: {
                        id: imageId,
                    },
                    data: {
                        data: file.buffer,
                    },
                });
            } else if (file && !imageId) {
                const newImage = await prisma.image.create({
                    data: {
                        data: file.buffer,
                    },
                });
                await prisma.product.update({
                    where: {
                        id: pid,
                    },
                    data: {
                        imageId: newImage.id,
                    },
                });
            }
            res.status(200).json({success: 'product updated'});
        } else {

            const product = await prisma.product.create({
                data: {
                    name: name,
                    variant1InStock: variant1InStock,
                    variant1Name: variant1Name,
                    variant1Price: variant1Price,
                    variant1Qty: variant1Qty,
                    variant2InStock: variant2InStock,
                    variant2Name: variant2Name,
                    variant2Price: variant2Price,
                    variant2Qty: variant2Qty,
                    description: description,
                    category: {
                        connect: {
                            id: categoryId,
                        },
                    },
                    enabled: enabled,
                    image: {
                        create: {
                            id: theNewId ? theNewId : undefined,
                            data: file.buffer,
                        },
                    },
                    createdAt: new Date(),
                },
            });
            res.status(200).json(product);
        }

    } else if (req.method === 'GET') {
        // method not allowed
        res.status(405).json({error: 'method not allowed'});
    }
}
