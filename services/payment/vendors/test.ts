import {PaymentNotify, PaymentUrl} from '../abstracts';
import {NextApiRequest, NextApiResponse} from 'next';
import {computerOrderTotal} from '../../utils';


interface IncomingNotifyBody {
    order_id: string,
    vendor_amount: string,
    vendor_currency: string,
}

export class TestPaymentNotify extends PaymentNotify {
    protected body: IncomingNotifyBody;

    constructor(req: NextApiRequest, res: NextApiResponse) {
        super(req, res);
        this.body = req.body as IncomingNotifyBody;
    }

    async getAmountPaid(): Promise<number | undefined> {
        return parseFloat(this.body.vendor_amount);
        // return this.body.vendor_amount;
    }

    async getRequestCurrency(): Promise<string | undefined> {
        return this.body.vendor_currency;
    }

    async getRequestOrderId(): Promise<number | undefined> {
        return parseInt(this.body.order_id);
        // return this.body.order_id;
    }

    async verifyRequest(): Promise<boolean> {
        return true;
    }

}

export class TestPaymentUrl extends PaymentUrl {

    getRedirectUrl(): string {
        return `/test_payment`;
    }

    async getBody(): Promise<{[key: string]: string | number | null}> {
        return {
            order_id: this.order.id,
            vendor_amount: await computerOrderTotal(this.order),
            vendor_currency: 'SGD',
            return_url: this.getReturnUrl(),
            cancel_url: this.getCancelUrl(),
        };
    }

    getMethod(): 'GET' | 'POST' {
        return 'POST';
    }
}

