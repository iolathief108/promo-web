import {NextApiRequest, NextApiResponse} from 'next';
import {Order, OrderItem} from '@prisma/client';
import {prisma} from '../../prisma';
import {computerOrderTotal} from '../utils';
import {sendMail} from '../email';
import moment from 'moment';
import {getInvoiceTemplate, TInvoiceData} from '../template';
import inlineCss from 'inline-css';
import {disableEmail} from '../../lib/config';
import {newOrderEmail} from '../../lib/config-server';


export class damn<T> {

    protected getMeta(): T {
        return {} as T;
    }

    protected setMeta(s: T) {

    }
}

export abstract class PaymentNotify {

    protected readonly currency: string;
    protected order?: Order & {items: OrderItem[]};
    public readonly response: SendResponse;

    protected constructor(protected req: NextApiRequest, protected res: NextApiResponse) {
        this.currency = 'SGD';
        this.response = new SendResponse(res);
    }

    /* Validate Request and status paid */
    protected abstract verifyRequest(): Promise<boolean>;

    abstract getRequestOrderId(): Promise<number | undefined>;

    abstract getAmountPaid(): Promise<number | undefined>;

    abstract getRequestCurrency(): Promise<string | undefined>;

    async getOrder(): Promise<Order & {items: OrderItem[]} | undefined> {
        const id = await this.getRequestOrderId();
        if (this.order && this.order.id === id) {
            return this.order;
        }
        if (typeof id !== 'number') {
            this.res.json({
                error: 'Order ID must be a number',
                debug: id,
            });
            return undefined;
            // throw new Error('Order not found');
        }
        const order = await prisma.order.findUnique({
            where: {id},
            include: {
                items: true,
            },
        });
        if (!order) {
            return undefined;
        }
        this.order = order;
        return order;
    }

    async getOrderTotal(): Promise<number | undefined> {
        const order = await this.getOrder();
        if (order) {
            return await computerOrderTotal(order);
        }
        return undefined;
    }

    async isPaymentConfirmed(): Promise<boolean> {
        if (!await this.verifyRequest()) {
            return false;
        }

        if (!await this.getOrder()) {
            throw new Error('Order not found');
        }

        if (await this.getRequestCurrency() !== this.currency) {
            return false;
        }

        if (await this.getRequestOrderId() === undefined) {
            return false;
        }

        if (await this.getAmountPaid() === undefined) {
            return false;
        }

        if (await this.getRequestOrderId() !== (await this.getOrder())?.id) {
            return false;
        }

        if (await this.getAmountPaid() !== await this.getOrderTotal()) {
            return false;
        }

        // reduce stock
        const order = await this.getOrder();
        if (order) {
            for (const item of order.items) {
                if (!item.productId) {
                    continue;
                }
                await prisma.product.update({
                    where: {
                        id: item.productId,
                    },
                    data: {
                        variant1Qty: {
                            decrement: item.variant1Qty,
                        },
                        variant2Qty: {
                            decrement: item.variant2Qty,
                        },
                    },
                });
            }
        }

        return true;
    }

    async sendSuccessMailToCustomer(): Promise<void> {
        const order = await this.getOrder();
        if (!order) {
            return;
        }

        let total = 0;
        order.items.forEach((item) => {
            total += item.variant1Qty * item.variant1Price;
            total += item.variant2Qty * item.variant2Price;
        });

        const data: TInvoiceData = {
            order: {
                id: order.id,
                created_at: moment(order.createdAt).format('MMM DD, YYYY hh:mm a'),
            },
            items: order?.items?.map(item => {
                if (item.variant1Qty) {
                    return {
                        name: `${item.name} - ${item.variant1Name}`,
                        price: item.variant1Price,
                        qty: item.variant1Qty,
                        total: item.variant1Qty * item.variant1Price,
                        last: false,
                    };
                }
                if (item.variant2Qty) {
                    return {
                        name: `${item.name} - ${item.variant2Name}`,
                        price: item.variant2Price,
                        qty: item.variant2Qty,
                        total: item.variant2Qty * item.variant2Price,
                        last: false,
                    };
                }
                return {
                    name: item.name,
                    price: 0,
                    qty: 0,
                    total: 0,
                    last: false,
                };
            }) || [],
            subTotal: total,
            total: total + order.deliveryFee,
            shippingCharge: order.deliveryFee,
        };

        // decimal places to 2
        data.total = Math.round(data.total * 100) / 100;
        data.subTotal = Math.round(data.subTotal * 100) / 100;
        data.shippingCharge = Math.round(data.shippingCharge * 100) / 100;

        const body = getInvoiceTemplate(data);
        const subject = 'Order has been paid';

        const bodyInline = await inlineCss(body, {
            url: '/',
        });

        if (!disableEmail) {
            await sendMail(order.email, subject, undefined, bodyInline);
            if (newOrderEmail) {
                await sendMail(newOrderEmail, subject, undefined, bodyInline);
            }
        }
    }
}

export class SendResponse {

    constructor(protected res: NextApiResponse) {
    }

    // final response
    async success() {
        this.res.status(200).end();
    }

    async orderNotFound() {
        this.res.status(404).json({
            error: 'Order not found',
        });
    }

    async paymentFailed() {
        this.res.status(400).json({
            error: 'Payment failed',
        });
    }
}

export abstract class PaymentUrl {

    protected returnUrl: string = '/order/success';

    protected cancelUrl: string = '/order/failed';

    constructor(protected order: Order & {items: OrderItem[]}) {
    }

    abstract getRedirectUrl(): string;

    abstract getBody(): Promise<{[key: string]: string | number | null} | undefined>;

    abstract getMethod(): 'GET' | 'POST';

    protected getReturnUrl(): string {
        return `${this.returnUrl}?order_id=${this.order.id}`;
    }

    protected getCancelUrl(): string {
        return `${this.cancelUrl}?order_id=${this.order.id}`;
    }
}
