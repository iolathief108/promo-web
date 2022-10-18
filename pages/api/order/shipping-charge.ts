import {NextApiRequest, NextApiResponse} from 'next';
import {CalculateDeliveryCost} from '../../../services/delivery';
import {getInvoiceTemplate, TInvoiceData} from '../../../services/template';
import {prisma} from '../../../prisma';
import moment from 'moment';
import inlineCss from 'inline-css';

// response the delivery cost
export default async function (req: NextApiRequest, res: NextApiResponse) {

    if (!req.body) {
        return 'Body is required';
    }

    // verify method
    if (req.method !== 'POST') {
        res.status(405).json({
            error: 'Method not allowed',
        });
        return;
    }

    const shippingCharge = await CalculateDeliveryCost({} as any);
    res.status(200).json({
        shippingCharge,
    });

}
