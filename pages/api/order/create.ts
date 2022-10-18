import {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from '../../../prisma';
import {getSession} from '../../../lib/session';
import {OrderStatus, OrderStatusKey, PaymentStatus, PaymentStatusKey} from '../../../services/order-meta';
import {validateEmail, validatePhone, validateZip} from '../../../lib/validators';
import {ReqOrderItem} from '../../../types';
import {getPaymentUrl} from '../../../services/payment';
import {PaymentUrl} from '../../../services/payment/abstracts';
import {CalculateDeliveryCost} from '../../../services/delivery';


export default async function create(req: NextApiRequest, res: NextApiResponse) {

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

    await getSession(req, res);

    if (!req.session.userId) {
        res.status(401).json({error: 'Unauthorized'});
        return;
    }

    const {
        firstName,
        lastName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        zip,
        deliveryFee,
        email
    } = req.body;


    // verify body
    const isVerified = await verifyOrder(req.body);
    if (isVerified !== true) {
        res.status(400).json({
            error: isVerified,
        });
        return;
    }

    // create the order
    const order = await prisma.order.create({
        data: {
            firstName,
            lastName,
            phone,

            addressLine1,
            addressLine2,
            city,
            state,
            email,
            zip,

            deliveryFee,
            userId: req.session.userId,
            createdAt: new Date(),

            items: {
                createMany: {
                    data: getOrderItems(req.body),
                },
            },
            metas: {
                createMany: {
                    data: [
                        {
                            key: PaymentStatusKey,
                            value: PaymentStatus.UNPAID.code,
                        },
                        {
                            key: OrderStatusKey,
                            value: OrderStatus.PENDING.code,
                        },
                    ],
                },
            },
        },
        include: {
            items: true,
        },
    });

    const paymentUrl: PaymentUrl = await getPaymentUrl(order);

    res.status(200).json({
        payment: {
            url: paymentUrl.getRedirectUrl(),
            body: await paymentUrl.getBody(),
            method: paymentUrl.getMethod(),
        },
        order: {
            id: order.id,
            createdAt: order.createdAt,
            items: order.items,
        },
    });
}

async function verifyOrder(body: any): Promise<true | string> {

    const {
        firstName,
        lastName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        zip,
        items,
        deliveryFee,
        email
    } = body;

    if (!firstName || typeof firstName !== 'string') {
        return 'First name is required';
    }
    if (!lastName || typeof lastName !== 'string') {
        return 'Last name is required';
    }
    if (!phone || typeof phone !== 'string') {
        return 'Phone is required';
    }
    if (!email || typeof email !== 'string' || !validateEmail(email)) {
        return 'Email is required';
    }

    if (!addressLine1 || typeof addressLine1 !== 'string') {
        return 'Address line 1 is required';
    }
    if (!city || typeof city !== 'string') {
        return 'City is required';
    }

    if (!zip || typeof zip !== 'string') {
        return 'Zip is required';
    }

    if (!deliveryFee || typeof deliveryFee !== 'number') {
        return 'Delivery fee is required';
    }

    // address line 2 is optional
    if (addressLine2 && typeof addressLine2 !== 'string') {
        return 'Address line 2 is not a string';
    }

    // state is optional
    if (state && typeof state !== 'string') {
        return 'State is not a string';
    }

    if (!validatePhone(phone)) {
        return 'Phone is invalid';
    }

    if (zip && !validateZip(zip)) {
        return 'Zip is invalid';
    }

    if (await CalculateDeliveryCost({} as any) !== deliveryFee) {
        return 'Delivery fee is not correct';
    }

    if (!items) {
        return 'Order items is required';
    }

    if (typeof items !== 'object' || !Array.isArray(items)) {
        return 'Order items is not an array';
    }

    if (items.length === 0) {
        return 'Order items is empty';
    }

    const isVerified = await verifyOrderItems(body);
    if (isVerified !== true) {
        return isVerified;
    }

    return true;
}

async function verifyOrderItems(body: any): Promise<true | string> {

    const {items} = body;
    if (!items || typeof items !== 'object') {
        return 'Order items is not an array';
    }
    if (items.length === 0) {
        return 'Order items is empty';
    }
    for (const orderItem of items) {
        const isVerified = await verifyOrderItem(orderItem);
        if (isVerified !== true) {
            return isVerified;
        }
    }

    return true;
}

async function verifyOrderItem(orderItem: any): Promise<true | string> {

    if (!orderItem) {
        return 'Order item is required';
    }

    const {
        productId,
        name,
        variant1Name,
        variant1Price,
        variant1Qty,
        variant2Name,
        variant2Price,
        variant2Qty,
    } = orderItem;

    if (!productId && typeof productId !== 'number') {
        return 'Product id is required';
    }
    if (!name && typeof name !== 'string') {
        return 'Product Name is required';
    }
    if (!variant1Name && typeof variant1Name !== 'string') {
        return 'Variant 1 name is required';
    }
    if (!variant1Price && typeof variant1Price !== 'number') {
        return 'Variant 1 price is required';
    }
    if (!variant1Qty && typeof variant1Qty !== 'number') {
        return 'Variant 1 qty is required';
    }
    if (!variant2Name && typeof variant2Name !== 'string') {
        return 'Variant 2 name is required';
    }
    if (!variant2Price && typeof variant2Price !== 'number') {
        return 'Variant 2 price is required';
    }
    if (!variant2Qty && typeof variant2Qty !== 'number') {
        return 'Variant 2 qty is required';
    }
    if (variant2Qty < 0) {
        return 'Variant 2 qty must be greater than 0';
    }
    if (variant1Qty < 0) {
        return 'Variant 1 qty must be greater than 0';
    }
    if (variant2Price < 0) {
        return 'Variant 2 price must be greater than 0';
    }
    if (variant1Price < 0) {
        return 'Variant 1 price must be greater than 0';
    }
    if (variant1Qty + variant2Qty <= 0) {
        return 'Variant 1 qty and variant 2 qty must be greater than 0';
    }
    if (variant1Qty + variant2Qty > 100) {
        return 'Variant 1 qty + variant 2 qty must be less than 100';
    }

    const product = await prisma.product.findUnique({
        where: {
            id: productId,
        },
    });
    if (!product) {
        return 'Product not found';
    }
    if (product.variant1Price !== variant1Price) {
        return 'Variant 1 price is invalid';
    }
    if (product.variant2Price !== variant2Price) {
        return 'Variant 2 price is invalid';
    }
    if (!product.variant1InStock && variant1Qty > 0) {
        return 'Variant 1 is out of stock';
    }
    if (!product.variant2InStock && variant2Qty > 0) {
        return 'Variant 2 is out of stock';
    }
    if (product.variant1Name !== variant1Name) {
        return 'Variant 1 name is invalid';
    }
    if (product.variant2Name !== variant2Name) {
        return 'Variant 2 name is invalid';
    }
    if (product.name !== name) {
        return 'Name is invalid';
    }
    if (!product.enabled) {
        return 'Product is disabled';
    }
    if (product.variant1Qty && (product.variant1Qty < variant1Qty)) {
        return `Variant 1 qty is greater than available qty (${product.variant1Qty})`;
    }
    if (product.variant2Qty && (product.variant2Qty < variant2Qty)) {
        return `Variant 2 qty is greater than available qty (${product.variant2Qty})`;
    }

    return true;
}

function getOrderItems(body: any): ReqOrderItem[] {
    const {items} = body;

    return items.map((orderItem: any) => {
        return {
            productId: orderItem.productId,
            name: orderItem.name,
            variant1Name: orderItem.variant1Name,
            variant1Price: orderItem.variant1Price,
            variant1Qty: orderItem.variant1Qty,
            variant2Name: orderItem.variant2Name,
            variant2Price: orderItem.variant2Price,
            variant2Qty: orderItem.variant2Qty,
        };
    });
}
