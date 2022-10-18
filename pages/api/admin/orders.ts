import {NextApiRequest, NextApiResponse} from 'next';
import {getSession} from '../../../lib/session';
import {prisma} from '../../../prisma';
import {OrderStatusKey, PaymentStatusKey} from '../../../services/order-meta';
import {Prisma} from '.prisma/client';
import OrderWhereInput = Prisma.OrderWhereInput;


// list orders by pagination
export default async (req: NextApiRequest, res: NextApiResponse) => {

    if (!verifyRequest(req, res) || !await verifyAuth(req, res)) {
        return;
    }

    const {page, perPage} = verifyPagination(req.query);
    const {filter, sort} = verifySorting(req.query);

    const where: OrderWhereInput | undefined = filter.length > 0 ? {
        OR: filter.map(status => ({
            metas: {
                some: {
                    key: OrderStatusKey,
                    value: status,
                },
            },
        })),
    } : undefined;

    const orderCount = await prisma.order.count({where});

    const orders = await prisma.order.findMany({
        where,
        skip: perPage * (page - 1),
        take: perPage,
        orderBy: {
            createdAt: sort === 'date_asc' ? 'asc' : 'desc',
        },
        include: {
            metas: true,
            items: {
                include: {
                    product: {
                        select: {
                            imageId: true
                        }
                    }
                }
            }
        },
    });

    const resOrders = orders.map(order => {
        const {metas} = order;
        const status = metas.find(meta => meta.key === OrderStatusKey);
        const payment = metas.find(meta => meta.key === PaymentStatusKey);
        // @ts-ignore
        delete order.metas;
        return {
            ...order,
            orderStatus: status ? status.value : 'processing',
            paymentStatus: payment ? payment.value : 'pending',
        };
    });

    res.status(200).json({
        orders: resOrders,
        totalPage: Math.ceil(orderCount / perPage),
    });
}

function verifyPagination(query: NextApiRequest['query']) {
    let page = query.page;
    if (Array.isArray(page)) {
        page = page[0];
    }
    const pageA = page ? parseInt(page) || 1 : 1;

    let take = query.take;
    if (Array.isArray(take)) {
        take = take[0];
    }
    const perPage = take ? parseInt(take) || 20 : 20;

    return {
        page: pageA,
        perPage,
    };
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
    if (!req.session.isAdmin) {
        res.status(401).json({message: 'Unauthorized'});
        return false;
    }
    return true;
}

function verifySorting(query: NextApiRequest['query']): {filter: string[], sort: 'date_desc' | 'date_asc'} {
    let filter = query.filter;
    if (Array.isArray(filter)) {
        filter = filter[0];
    }
    let arrFilter: string[] = [];
    if (filter) {
        filter = filter.toLowerCase();
        if (filter !== 'pending' && filter !== 'processing' && filter !== 'completed' && filter !== 'cancelled') {
            // filter = 'pending';
            arrFilter = [];
        } else if (filter === 'pending' || filter === 'processing') {
            // arrFilter = ['pending', 'processing'];
            if (filter === 'pending') {
                arrFilter = ['pending'];
            }
            if (filter === 'processing') {
                arrFilter = ['processing'];
            }
        } else {
            arrFilter = [filter];
        }
    } else {
        // filter = 'pending';
        arrFilter = [];
    }

    let sort: 'date_asc' | 'date_desc' = query.sort as any;
    if (Array.isArray(sort)) {
        sort = sort[0];
    }
    if (sort) {
        sort = sort.toLowerCase() as any;
        if (sort !== 'date_asc' && sort !== 'date_desc') {
            sort = 'date_desc';
        }
    } else {
        sort = 'date_desc';
    }

    return {filter: arrFilter, sort};
}
