import {NextApiRequest, NextApiResponse} from 'next';
import {getSession} from '../../../lib/session';
import multer from 'multer';
import {runMiddleware} from '../../../lib/middle';
import {File} from '../../../types';
import {prisma} from '../../../prisma';

// noinspection JSUnusedGlobalSymbols
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async (req: NextApiRequest & {files: any;}, res: NextApiResponse) => {
    if (req.method === 'POST') {
        const session = await getSession(req, res);

        if (!session.isAdmin) {
            res.status(400).json({error: 'you are not admin'});
            return;
        }

        const storage = multer.memoryStorage();
        const upload = multer({storage: storage});
        await runMiddleware(req, res, upload.fields([
            {name: 'dod1', maxCount: 1},
            {name: 'dod2', maxCount: 1},
            {name: 'dod3', maxCount: 1},
            {name: 'dod4', maxCount: 1},
            {name: 'slider1', maxCount: 1},
            {name: 'slider2', maxCount: 1},
            {name: 'slider3', maxCount: 1},
            {name: 'slider4', maxCount: 1},
            {name: 'slider5', maxCount: 1},
            {name: 'slider6', maxCount: 1},
            {name: 'bannerA', maxCount: 1},
            {name: 'bannerB', maxCount: 1},
            {name: 'bannerC', maxCount: 1},
        ]));
        const files = req?.files as {[key: string]: File[]};

        // for each file in files
        for (const key in files) {
            // check file exist
            if (files[key] && files[key][0]) {
                const doc = await prisma.document.findUnique({
                    where: {
                        key,
                    },
                });
                // delete old file
                if (doc) {
                    await prisma.document.delete({
                        where: {
                            id: doc.id,
                        },
                    });
                    await prisma.image.delete({
                        where: {
                            id: JSON.parse(doc.value).value,
                        },
                    });
                }
                // save to database image model
                const image = await prisma.image.create({
                    data: {
                        data: files[key][0].buffer,
                    },
                });
                // save to doc
                await prisma.document.create({
                    data: {
                        key,
                        value: JSON.stringify({value: image.id}),
                    },
                });
            }
        }

        let {
            shippingCharge,
            dod1ProductId,
            dod2ProductId,
            dod3ProductId,
            dod4ProductId,
        } = req.body;
        console.log(shippingCharge);
        shippingCharge = parseFloat(JSON.parse(shippingCharge));
        // shippingCharge = Number(shippingCharge);
        console.log(shippingCharge);

        dod1ProductId = parseInt(dod1ProductId);
        dod2ProductId = parseInt(dod2ProductId);
        dod3ProductId = parseInt(dod3ProductId);
        dod4ProductId = parseInt(dod4ProductId);

        if (shippingCharge && typeof shippingCharge === 'number') {
            await prisma.document.upsert({
                where: {
                    key: 'shippingCharge',
                },
                update: {
                    value: JSON.stringify({value: shippingCharge}),
                },
                create: {
                    key: 'shippingCharge',
                    value: JSON.stringify({value: shippingCharge}),
                },
            });
        }
        if (dod1ProductId && typeof dod1ProductId === 'number') {
            await prisma.document.upsert({
                where: {
                    key: 'dod1ProductId',
                },
                update: {
                    value: JSON.stringify({value: dod1ProductId}),
                },
                create: {
                    key: 'dod1ProductId',
                    value: JSON.stringify({value: dod1ProductId}),
                },
            });
        }
        if (dod2ProductId && typeof dod2ProductId === 'number') {
            await prisma.document.upsert({
                where: {
                    key: 'dod2ProductId',
                },
                update: {
                    value: JSON.stringify({value: dod2ProductId}),
                },
                create: {
                    key: 'dod2ProductId',
                    value: JSON.stringify({value: dod2ProductId}),
                },
            });
        }
        if (dod3ProductId && typeof dod3ProductId === 'number') {
            await prisma.document.upsert({
                where: {
                    key: 'dod3ProductId',
                },
                update: {
                    value: JSON.stringify({value: dod3ProductId}),
                },
                create: {
                    key: 'dod3ProductId',
                    value: JSON.stringify({value: dod3ProductId}),
                },
            });
        }
        if (dod4ProductId && typeof dod4ProductId === 'number') {
            await prisma.document.upsert({
                where: {
                    key: 'dod4ProductId',
                },
                update: {
                    value: JSON.stringify({value: dod4ProductId}),
                },
                create: {
                    key: 'dod4ProductId',
                    value: JSON.stringify({value: dod4ProductId}),
                },
            });
        }

        res.status(200).json({success: true});
    } else {
        // return all documents
        const documents = await prisma.document.findMany();
        res.status(200).json(documents.map(doc => ({
            key: doc.key,
            value: JSON.parse(doc.value).value,
        })));
    }
}
