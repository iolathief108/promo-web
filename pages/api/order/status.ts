import {NextApiRequest, NextApiResponse} from 'next';
import {OrderStatusKey, PaymentStatusKey} from '../../../services/order-meta';
import {getSession} from '../../../lib/session';
import {prisma} from '../../../prisma';


export default async function (req: NextApiRequest, res: NextApiResponse) {
    const {
        meta,
        orderId,
    } = req.body;

    const session = await getSession(req, res);

    // check if user is logged in
    if (!req.session.userId) {
        res.status(401).json({message: 'Unauthorized'});
        return;
    }

    // verify order ID
    if (!orderId) {
        res.status(400).json({
            error: 'Order ID is required',
        });
        return;
    }

    if (typeof orderId !== 'number') {
        res.status(400).json({
            error: 'Order ID must be a number',
        });
        return;
    }

    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
    });

    if (!order) {
        res.status(404).json({
            error: 'Order not found',
        });
        return;
    }

    // check if user own the order
    if (order.userId !== session.userId) {
        res.status(403).json({
            error: 'You are not authorized to update this order',
        });
        return;
    }

    if (!meta) {
        res.status(400).json({
            error: 'Meta is required',
        });
        return;
    }

    // if paymentStausKey
    if (meta === PaymentStatusKey) {
        const paymentStatus = await prisma.orderMeta.findUnique({
            where: {
                orderId_key: {
                    key: PaymentStatusKey,
                    orderId,
                },
            },
            select: {
                key: true,
                value: true,
            }
        });

        if (paymentStatus) {
            res.status(200).json(paymentStatus);
        } else {
            res.status(404).end();
        }
        return;
    }

    if (meta === OrderStatusKey) {
        const orderStatus = await prisma.orderMeta.findUnique({
            where: {
                orderId_key: {
                    key: OrderStatusKey,
                    orderId,
                },
            },
            select: {
                key: true,
                value: true,
            }
        });

        if (orderStatus) {
            res.status(200).json(orderStatus);
        } else {
            res.status(404).end();
        }
        return;
    }

    if (meta === 'all') {
        const orderStatus = await prisma.orderMeta.findMany({
            where: {
                OR: [
                    {key: PaymentStatusKey, orderId},
                    {key: OrderStatusKey, orderId},
                ]
            },
            select: {
                key: true,
                value: true,
            }
        });

        if (orderStatus) {
            res.status(200).json(orderStatus);
        } else {
            res.status(404).end();
        }
        return;
    }
}
