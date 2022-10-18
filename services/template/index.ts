import * as fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import getConfig from 'next/config';

// get handlebar email customer ivoice template
const serverPath = (staticFilePath: string) => {
    console.log(getConfig());
    return path.join(process.cwd());
};

export type TInvoiceData = {
    items: {
        name: string;
        price: number;
        qty: number;
        total: number;
        last: boolean;
    }[];
    total: number;
    order: {
        created_at: string;
        id: number
    }
    shippingCharge: number;
    subTotal: number;
}
export const getInvoiceTemplate = (order: TInvoiceData) => {
    // get template from file
    const template = fs.readFileSync(
        path.join(process.cwd(), 'pages/api/emails/invoice.hbs')
        , 'utf8');

    // replace template with data using handlebar
    const templateRender = handlebars.compile(template);

    return templateRender(order);
};
