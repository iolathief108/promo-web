import {NextApiRequest, NextApiResponse} from 'next';
import {getSession} from '../../../lib/session';
import {prisma} from '../../../prisma';
import {OrderStatusKey, PaymentStatusKey} from '../../../services/order-meta';


// list orders by pagination
export default async (req: NextApiRequest, res: NextApiResponse) => {

    let {
        page,
        take,
    } = req.query;

    if (Array.isArray(page)) {
        page = page[0];
    }

    if (Array.isArray(take)) {
        take = take[0];
    }

    const perPage = take ? parseInt(take) || 20 : 20;

    if (req.method !== 'GET') {
        res.status(405).json({
            error: 'Method not allowed',
        });
        return;
    }

    const session = await getSession(req, res);

    // check if user is logged in
    if (typeof req.session.userId !== 'number') {
        res.status(401).json({message: 'Unauthorized'});
        return;
    }

    // verify page number
    const pageA = page ? parseInt(page) || 1 : 1;

    const orders = await prisma.order.findMany({
        where: {
            userId: session.userId,
        },
        skip: perPage * (pageA - 1),
        take: perPage,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            items: {
                include: {
                    product: {
                        select: {
                            imageId: true
                        }
                    }
                }
            },
            metas: true
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
    });
}
