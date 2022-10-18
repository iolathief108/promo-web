import {Product} from '@prisma/client';
import {proxy, subscribe} from 'valtio';
import {derive} from 'valtio/utils';
import {Storage} from '../storage';
import {getProduct} from '../lib/fetcher';
import {numberToMoney} from '../lib/utils';


export interface CartItem {
    product: Product,
    v1Qty: number,
    v2Qty: number,
}

interface CartState {
    cart?: CartItem[];
}

export const cartState = proxy<CartState>({
    cart: undefined,
});

export const cartCalc = derive({
    orderTotal: (get) => {
        const cart = get(cartState).cart;
        if (!cart) return 0;
        if (cart.length === 0) {
            return '0';
        }
        const A = cart?.reduce((acc, item) => acc + item.product.variant1Price * item.v1Qty + item.product.variant2Price * item.v2Qty, 0);
        return numberToMoney(A);
    },
});

// devtools(cartState, {name: 'Cart State', enabled: isDevelopment});
// devtools(cartCalc, {name: 'Cart Calc', enabled: isDevelopment});

export const getCartTotal = (cart: CartItem[]) => {
    const cartA = cart;
    if (cartA.length === 0) {
        return 0;
    }
    if (!cartA) {
        return 0;
    }
    return cartA?.reduce((acc, item) => acc + item.product.variant1Price * item.v1Qty + item.product.variant2Price * item.v2Qty, 0);
};

export const cartActions = {
    add: (product: Product, v1Qty: number, v2Qty: number) => {

        if (v1Qty + v2Qty === 0) {
            return;
        }

        if (!product.variant1InStock) {
            v1Qty = 0;
        }
        if (!product.variant2InStock) {
            v2Qty = 0;
        }
        const cart = [...(cartState.cart || [])];
        const index = cart.findIndex(item => item.product.id === product.id);



        if (index === -1) {
            cart.push({
                product,
                v1Qty,
                v2Qty,
            });
        } else {
            if (product.variant1Qty && product.variant1Qty < cart[index].v1Qty + v1Qty) {
                alert('Variant 1 quantity is not available');
                return;
            }
            if (product.variant2Qty && product.variant2Qty < cart[index].v2Qty + v2Qty) {
                alert('Variant 2 quantity is not available');
                return;
            }
            cart[index].v1Qty += v1Qty;
            cart[index].v2Qty += v2Qty;
        }
        cartState.cart = cart;
    },
    setV1Qty: (product: Product, v1Qty: number) => {

        if (!product.variant1InStock) {
            v1Qty = 0;
        }

        if (v1Qty < 0) {
            return;
        }
        if (product.variant1Qty && product.variant1Qty < v1Qty) {
            alert('Variant 1 quantity is not available');
        }

        const cart = [...(cartState.cart || [])];
        const index = cart.findIndex(item => item.product.id === product.id);
        if (index === -1) {
            return;
        }
        if (cart[index].v2Qty + v1Qty === 0) {
            cart.splice(index, 1);
        } else {
            cart[index].v1Qty = v1Qty;
        }
        cartState.cart = cart;
    },
    setV2Qty: (product: Product, v2Qty: number) => {
        if (!product.variant2InStock) {
            v2Qty = 0;
        }

        if (v2Qty < 0) {
            return;
        }

        if (product.variant2Qty && product.variant2Qty < v2Qty) {
            alert('Variant 2 quantity is not available');
        }

        const cart = [...(cartState.cart || [])];
        const index = cart.findIndex(item => item.product.id === product.id);
        if (index === -1) {
            return;
        }
        if (cart[index].v1Qty + v2Qty === 0) {
            cart.splice(index, 1);
        } else {
            cart[index].v2Qty = v2Qty;
        }
        cartState.cart = cart;
    },
    remove: (productId: number) => {
        const newcart = [...(cartState.cart || [])];
        cartState.cart = newcart.filter(item => item.product.id !== productId);
    },
    clear: () => {
        cartState.cart = [];
    },
};

export const cartUtils = {};

subscribe(cartState, () => {
    Storage.cart.set(cartState.cart || []);
});


// async sleep
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// load cart from storage
(async () => {

    if (typeof window === 'undefined') {
        return;
    }
    const cart = await Storage.cart.get();
    const cartStateNew: any[] = [];
    if (cart && cart.length) {
        for (let cartItem of cart) {
            // get product from id
            const product = await getProduct(cartItem.product.id);
            if (product) {
                cartStateNew.push({
                    product,
                    v1Qty: cartItem.v1Qty,
                    v2Qty: cartItem.v2Qty,
                });
            }
        }
        if (cartState.cart === undefined) {
            cartState.cart = cartStateNew;
        }
    }
})();
