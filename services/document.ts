import {prisma} from '../prisma';
import {Document} from '@prisma/client';


async function addDocument(key:string, document: Object): Promise<Document> {

    return prisma.document.create({
        data: {
            key,
            value: JSON.stringify(document)
        }
    });
}

async function getDocument(key:string): Promise<Document | null> {

    return prisma.document.findUnique({
        where: {
            key
        }
    });
}

export const DeliveryCostDoc = {
    async set(deliveryCost: number) {
        await addDocument('shippingCharge', deliveryCost);
    },
    async get(): Promise<number | null> {
        const document = await getDocument('shipingCharge');
        if (document) {
            return parseInt(document.value);
        }
        return null;
    }
}
