import { IncomingMessage } from "http";
import { Session } from "next-session/lib/types";
import * as buffer from 'buffer';
import {Readable} from 'stream';
import {OrderItem} from '@prisma/client';

export interface SessionData {
    userId?: number
    isAdmin?: boolean
}

declare module "next" {
    export interface NextApiRequest extends IncomingMessage {
        session: Session<SessionData>;
    }
}

/*
* banners
* shipping cost
* */
interface DOC_API_GET {
    bannerAImageId: number;
    shippingCost: number;
}

interface DOC_API_POST {
    bannerAImage: Buffer;
    shippingCost: number;
}

export interface File {
    fieldname: string;
    originalname: string;
    mimetype: string;
    size: number;
    stream: Readable;
    buffer: Buffer;
}

export type ReqOrderItem = Omit<OrderItem, 'id' | 'orderId'>
