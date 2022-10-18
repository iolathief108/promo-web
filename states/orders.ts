import {proxy} from 'valtio';
import {getUserOrders, ResOrder} from '../lib/fetcher';
import moment from 'moment';


interface Interface {
    orders: ResOrder[];
    end: boolean;
    page: number;
    init: boolean;
}

export interface OrderDisplayItem {
    productName: string
    varName: string;
    varPrice: number;
    varQty: number;
    imageId?: number;
}

const defaultState: Interface = {
    orders: [],
    end: false,
    page: 0,
    init: false,
};

const perPage = 4;

const userOrders = proxy<Interface>({
    ...defaultState,
});

export default userOrders;

let expander = false;

export const OrderActions = {
    init: async () => {
        // prevent expand
        userOrders.end = true;
        userOrders.init = false;

        // reset
        userOrders.orders = [];
        userOrders.page = 1;

        // get orders
        const {orders, error} = await getUserOrders({
            take: perPage,
            page: userOrders.page,
        });
        if (error) {
            return;
        }
        userOrders.orders = orders;

        userOrders.end = false;
        if (orders.length < perPage) {
            userOrders.end = true;
        }
        userOrders.init = true;
    },
    expand: async () => {
        if (userOrders.end || !userOrders.init || expander) {
            return;
        }
        expander = true;

        let {orders, error} = await getUserOrders({
            take: perPage,
            page: userOrders.page + 1,
        });
        if (userOrders.end || !userOrders.init) {
            expander = false;
            return;
        }

        if (error) {
            expander = false;
            return;
        }

        if (!orders.length) {
            userOrders.end = true;
            expander = false;
            return;
        }
        userOrders.page++;

        // remove duplicates
        orders = orders.filter(order => {
            return !userOrders.orders.find(o => o.id === order.id);
        });

        userOrders.orders = [...userOrders.orders, ...orders];

        if (orders.length < perPage) {
            expander = false;
            userOrders.end = true;
        }
        expander = false;
    },
    empty: async () => {
        userOrders.orders = [];
        userOrders.end = false;
        userOrders.page = 1;
    },
    getOrder(orderId: number) {
        return userOrders.orders.find(order => order.id === orderId);
    },
};

export class TheOrder {
    constructor(public order: ResOrder) {

    }

    get id() {
        return this.order.id;
    }

    get orderStatus() {
        switch (this.order.orderStatus) {
            case 'pending':
                return 'Pending';
            case 'processing':
                return 'Processing';
            case 'completed':
                return 'Completed';
            case 'cancelled':
                if (this.order.paymentStatus === 'refunded') {
                    return 'Refunded';
                }
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    }

    get statusColor() {
        switch (this.order.orderStatus) {
            case 'pending':
                return 'color-red';
            case 'processing':
                return 'color-yellow';
            case 'completed':
                return 'color-green';
            case 'cancelled':
                return 'color-red';
            default:
                return 'color-red';
        }
    }

    get subtotal() {
        let subtotal = 0;
        this.order.items.forEach(item => {
            subtotal += item.variant1Price * item.variant1Qty;
            subtotal += item.variant2Price * item.variant2Qty;
        });
        return subtotal;
    }

    get total() {
        return this.subtotal + this.order.deliveryFee;
    }

    get address() {
        return {
            addrLine1: this.order.addressLine1,
            addrLine2: this.order.addressLine2,
            city: this.order.city,
            state: this.order.state,
            zip: this.order.zip,
        };
    }

    get orderDate() {
        return moment(this.order.createdAt).format('MMM DD, YYYY');
    }

    get name() {
        return this.order.firstName + ' ' + this.order.lastName;
    }

    get items() {
        let data: OrderDisplayItem[] = [];

        this.order.items.forEach(item => {
            if (item.variant1Qty) {
                data.push({
                    productName: item.name,
                    varName: item.variant1Name,
                    varPrice: item.variant1Price,
                    varQty: item.variant1Qty,
                    imageId: item.product?.imageId,
                });
            }
            if (item.variant2Qty) {
                data.push({
                    productName: item.name,
                    varName: item.variant2Name,
                    varPrice: item.variant2Price,
                    varQty: item.variant2Qty,
                    imageId: item.product?.imageId,
                });
            }
        });
        return data;
    }

    get phone() {
        return this.order.phone;
    }
}
