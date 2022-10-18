import {Product} from '@prisma/client';
import AsyncLocalStorage from '../lib/async-storage';


type Cart = {
    product: Pick<Product, 'id'>,
    v1Qty: number,
    v2Qty: number,
}[]

export const Storage = {
    cart: {
        set: async (cart: Cart) => {
            if (window) {
                await AsyncLocalStorage.setItem('cart', JSON.stringify(cart));
            }
        },
        get: async (): Promise<Cart | undefined> => {
            if (window) {
                const cart = await AsyncLocalStorage.getItem('cart');
                return cart ? JSON.parse(cart) : [];
            }
        }
    },
};
