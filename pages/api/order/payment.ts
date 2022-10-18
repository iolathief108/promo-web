import {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../../prisma';
import {PaymentStatus, PaymentStatusKey} from '../../../services/order-meta';
import {getPaymentNotify} from '../../../services/payment';
import {PaymentNotify} from '../../../services/payment/abstracts';


// success Payment notification listener
export default async (req: NextApiRequest, res: NextApiResponse) => {

    // verify request
    const paymentNotify: PaymentNotify = await getPaymentNotify(req, res);

    if (!await paymentNotify.isPaymentConfirmed()) {
        await paymentNotify.response.paymentFailed();
        return;
    }

    const order = await paymentNotify.getOrder();

    if (!order || !order.id || !order.items || !order.items.length) {
        res.status(400).json({
            error: 'Order not found',
        });
        await paymentNotify.response.orderNotFound();
        return;
    }

    await prisma.orderMeta.update({
        where: {
            orderId_key: {
                key: PaymentStatusKey,
                orderId: order.id,
            },
        },
        data: {
            value: PaymentStatus.PAID.code,
        },
    });

    await paymentNotify.response.success();
    paymentNotify.sendSuccessMailToCustomer()
}
