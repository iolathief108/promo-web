import {Order} from '@prisma/client';
import {prisma} from '../prisma';


export async function CalculateDeliveryCost(order: Order): Promise<number> {

    // const deliveryCost = await DeliveryCostDoc.get();
    const docValue = (await prisma.document.findUnique({
        where: {
            key: 'shippingCharge',
        }
    }))?.value
    if (docValue) {
        let parse = JSON.parse(docValue)?.value;
        if (parse && typeof parse === 'number') {
            return parse;
        }
    }

    return 0;
}
