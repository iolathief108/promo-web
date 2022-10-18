// export api
import {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../prisma';
import {Prisma} from '.prisma/client';
import ProductWhereInput = Prisma.ProductWhereInput;


// returns a list of products
// for query of search term and category
export default async (req: NextApiRequest, res: NextApiResponse) => {

    if (req.method === 'POST') {
        res.status(405).end();
    }


    const {query} = req;
    let {search, category, take, page} = query;
    if (Array.isArray(search)) {
        search = search[0];
    }
    if (Array.isArray(page)) {
        page = page[0];
    }
    if (!Array.isArray(category)) {
        category = category ? [category] : [];
    }

    if (Array.isArray(take)) {
        take = take[0];
    }
    const perPage = take ? parseInt(take) : 20;

    // first word of search term
    // const wordFirst = search ? search.split(' ')[0] : '';

    // remove more than one space in search term
    search = search ? search.replace(/\s+/g, ' ') : '';

    // replace space with |
    search = search ? search.replace(/\s/g, ' | ') : '';

    const pageA = page ? parseInt(page) || 1 : 1;

    const where: ProductWhereInput = {
        OR: search ? [
            {name: {search, mode: 'insensitive'}},
        ] : undefined,
        enabled: true,
        category: category.length > 0 ? {
            OR: [
                ...category.map(c => ({slug: c})),
                // ...category.map(c => ({name: c})),
            ],
        } : undefined,
    };

    const productCount = await prisma.product.count({
        where,
    });

    const products = await prisma.product.findMany({
        where,
        take: perPage,
        skip: perPage * (pageA - 1),
        orderBy: {
            _relevance: search ? {
                fields: ['name'],
                sort: 'desc',
                // search: wordFirst,
                search: search,
            } : undefined,
            createdAt: search ? undefined : 'desc',
        },
        select: {
            name: true,
            id: true,
            categoryId: true,
            enabled: true,
            imageId: true,
            variant1Price: true,
            variant2Price: true,
            variant1Qty: true,
            variant2Qty: true,
            variant1InStock: true,
            variant2InStock: true,
            variant1Name: true,
            variant2Name: true,
        },
    });

    // cache control for 1 day
    res.setHeader('Cache-Control', 'maxage=86400, stale-while-revalidate');

    res.status(200).json({products, totalPage: Math.ceil(productCount / perPage)});
}
