import {NextApiRequest, NextApiResponse} from 'next';
import {getSession} from '../../../lib/session';
import {prisma} from '../../../prisma';
import {OrderStatusKey, PaymentStatusKey} from '../../../services/order-meta';


export default async (req: NextApiRequest, res: NextApiResponse) => {

    if (!verifyRequest(req, res) || !await verifyAuth(req, res)) {
        return;
    }

    const data = await getUpdateData(req, res);
    if (!data) {
        return;
    }
    const {orderId, orderStatus, paymentStatus} = data;


    if (orderStatus) {
        const orderMeta = await prisma.orderMeta.upsert({
            where: {
                orderId_key: {
                    key: OrderStatusKey,
                    orderId: orderId,
                },
            },
            create: {
                key: OrderStatusKey,
                value: orderStatus,
                orderId,
            },
            update: {
                value: orderStatus,
            },
        });
        if (!orderMeta) {
            res.status(500).json({message: 'Error updating order status'});
            return;
        }
        res.status(200).json({message: 'Order status updated'});
    }
    if (paymentStatus) {
        const orderMeta = await prisma.orderMeta.upsert({
            where: {
                orderId_key: {
                    key: PaymentStatusKey,
                    orderId: orderId,
                },
            },
            create: {
                key: PaymentStatusKey,
                value: paymentStatus,
                orderId,
            },
            update: {
                value: paymentStatus,
            },
        });
        if (!orderMeta) {
            res.status(500).json({message: 'Error updating payment status'});
            return;
        }
        res.status(200).json({message: 'Payment status updated'});
    }
}

function verifyRequest(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {
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

async function getUpdateData(req: NextApiRequest, res: NextApiResponse) {
    const {orderId, orderStatus, paymentStatus} = req.body;
    if (!orderId) {
        res.status(400).json({message: 'Missing id'});
        return;
    }

    // order status or payment status is required
    if (!orderStatus && !paymentStatus) {
        res.status(400).json({message: 'Missing order status or payment status'});
        return;
    }

    if (orderStatus) {

        if (!['pending', 'processing', 'completed', 'cancelled'].includes(orderStatus)) {
            res.status(400).json({message: 'Invalid orderStatus'});
            return;
        }
    }

    if (paymentStatus) {
        if (!['paid', 'unpaid', 'refunded'].includes(paymentStatus)) {
            res.status(400).json({message: 'Invalid paymentStatus'});
            return;
        }
    }

    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
    });
    if (!order) {
        res.status(404).json({message: 'Order not found'});
        return;
    }

    return {orderId, orderStatus, paymentStatus};
}
