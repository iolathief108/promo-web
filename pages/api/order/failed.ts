import {NextApiRequest, NextApiResponse} from 'next';
import {getSession} from '../../../lib/session';
import {prisma} from '../../../prisma';
import {
    CancelReason,
    CancelReasonKey,
    OrderStatus,
    OrderStatusKey,
    PaymentStatus,
    PaymentStatusKey,
} from '../../../services/order-meta';


export default async (req: NextApiRequest, res: NextApiResponse) => {

    const {
        key,
        orderId
    } = req.body;

    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'Method not allowed',
        });
        return;
    }

    const session = await getSession(req, res);

    // check if user is logged in
    if (!req.session.userId) {
        res.status(401).json({message: 'Unauthorized'});
        return;
    }

    if (!key) {
        res.status(400).json({
            error: 'Key is required',
        });
        return;
    }

    if (typeof orderId !== 'number') {
        res.status(400).json({
            error: 'Order ID must be a number',
        });
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



    if (key === 'order_payment_failed') {

        const paymentStatus = await prisma.orderMeta.findUnique({
            where: {
                orderId_key: {
                    key: PaymentStatusKey,
                    orderId,
                },
            },
        });

        if (!paymentStatus) {
            res.status(404).json({
                error: 'Payment status not found',
            });
            return;
        }

        if (paymentStatus.value !== PaymentStatus.UNPAID.code) {
            res.status(400).json({
                error: 'Payment status is already updated',
            });
            return;
        }

        const orderStatus = await prisma.orderMeta.findUnique({
            where: {
                orderId_key: {
                    key: OrderStatusKey,
                    orderId,
                }
            }
        });

        if (!orderStatus) {
            res.status(404).json({
                error: 'Order status not found',
            });
            return;
        }

        if (orderStatus.value !== OrderStatus.PENDING.code) {
            res.status(400).json({
                error: 'Order status is not pending',
            });
            return;
        }

        await prisma.orderMeta.update({
            where: {
                orderId_key: {
                    key: OrderStatusKey,
                    orderId,
                },
            },
            data: {
                value: OrderStatus.CANCELLED.code,
            },
        });

        await prisma.orderMeta.upsert({
            where: {
                orderId_key: {
                    key: CancelReasonKey,
                    orderId,
                }
            },
            update: {
                key: CancelReasonKey,
                orderId,
                value: CancelReason.PAYMENT_FAILED.code,
            },
            create: {
                key: CancelReasonKey,
                orderId,
                value: CancelReason.PAYMENT_FAILED.code,
            }
        })

        res.status(200).json({
            message: 'Payment failed',
        });
        return;
    }

    res.status(400).json({
        error: 'Invalid key',
    });
}

