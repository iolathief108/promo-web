import {NextApiRequest, NextApiResponse} from 'next';
import {Order, OrderItem} from '@prisma/client';
import {PaymentNotify, PaymentUrl} from './abstracts';
import {TestPaymentNotify, TestPaymentUrl} from './vendors/test';

// edit this file to return the default payment notify object
export function getPaymentNotify(req: NextApiRequest, res: NextApiResponse): PaymentNotify {
    return new TestPaymentNotify(req, res);
}

// edit this file to return the default payment url object
export function getPaymentUrl(order: Order & {items: OrderItem[]}): PaymentUrl {
    return new TestPaymentUrl(order);
}
