import {proxy} from 'valtio';
import {getAdminOrders, ResOrder, updateAdminOrderStatus} from '../lib/fetcher';


interface Interface {
    orders: ResOrder[];
    filter: 'all' | 'pending' | 'completed' | 'cancelled';
    sort: 'date_desc' | 'date_asc';
    totalPage: number;
    currentPage: number;
}

const defaultState: Interface = {
    orders: [],
    filter: 'pending',
    sort: 'date_desc',
    totalPage: 1,
    currentPage: 1,
};
const perPage = 10;

const adminOrders = proxy<Interface>({
    ...defaultState,
});

export default adminOrders;

export const AdminOrderActions = {
    init: async () => {
        // reset
        adminOrders.orders = [];
        adminOrders.filter = defaultState.filter;
        adminOrders.sort = defaultState.sort;
        adminOrders.totalPage = defaultState.totalPage;
        adminOrders.currentPage = defaultState.currentPage;

        // get orders
        const {orders, totalPage} = await getAdminOrders({
            sort: adminOrders.sort,
            state: adminOrders.filter,
            take: perPage,
            page: adminOrders.currentPage,
        });

        adminOrders.orders = orders;
        adminOrders.totalPage = totalPage;
    },
    paginate: async (page: number) => {
        if (page < 1 || page > adminOrders.totalPage) {
            return;
        }
        adminOrders.currentPage = page;
        const {orders, totalPage} = await getAdminOrders({
            sort: adminOrders.sort,
            state: adminOrders.filter,
            take: perPage,
            page: adminOrders.currentPage,
        });

        adminOrders.orders = orders;
        adminOrders.totalPage = totalPage;

        // scroll to top
        window.scrollTo(0, 0);
    },
    filter: async (filter: 'all' | 'pending' | 'completed' | 'cancelled') => {
        adminOrders.filter = filter;
        adminOrders.currentPage = 1;
        const {orders, totalPage} = await getAdminOrders({
            sort: adminOrders.sort,
            state: adminOrders.filter,
            take: perPage,
            page: adminOrders.currentPage,
        });

        adminOrders.orders = orders;
        adminOrders.totalPage = totalPage;

    },
    nextPage: async () => {
        if (adminOrders.currentPage < adminOrders.totalPage) {
            AdminOrderActions.paginate(adminOrders.currentPage + 1);
        }
    },
    prevPage: async () => {
        if (adminOrders.currentPage > 1) {
            AdminOrderActions.paginate(adminOrders.currentPage - 1);
        }
    },
    cancel: async (orderId: number) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            const {success} = await updateAdminOrderStatus({
                orderId,
                orderStatus: 'cancelled',
            });
            if (success) {
                adminOrders.orders = adminOrders.orders.map(order => {
                    if (order.id === orderId) {
                        order.orderStatus = 'cancelled';
                    }
                    return order;
                });
            }
        }
    },
    refund: async (orderId: number) => {
        if (window.confirm('Are you sure you want to refund this order?')) {
            const {success} = await updateAdminOrderStatus({
                orderId,
                paymentStatus: 'refunded',
            });
            if (success) {
                const orders = adminOrders.orders.map(order => {
                    if (order.id === orderId) {
                        order.paymentStatus = 'refunded';
                    }
                    return order;
                });
                adminOrders.orders = [...orders];
            }
        }
    },
    execute: async (orderId: number) => {

        if (window.confirm('Are you sure you want to execute this order?')) {

            const order = adminOrders.orders.find(o => o.id === orderId);

            if (order?.orderStatus === 'completed') {
                return;
            }
            if (order?.orderStatus === 'cancelled') {
                return;
            }

            if (!order) {
                return;
            }
            let nextStatus;
            if (order.orderStatus === 'pending') {
                nextStatus = 'processing';
            }
            if (order.orderStatus === 'processing') {
                nextStatus = 'completed';
            }

            const {success} = await updateAdminOrderStatus({
                orderId,
                orderStatus: nextStatus as any,
            });
            if (success) {
                const orders = adminOrders.orders.map(o => {
                    let newOrder = {
                        ...o,
                    }
                    if (o.id === orderId) {
                        newOrder.orderStatus = nextStatus;
                    }
                    return newOrder;
                });
                adminOrders.orders = [...orders];
            } else {
            }
        }
    },
};


export const getAllOrderStatus = () => {
    return [
        {
            label: 'All',
            value: 'all',
        },
        {
            label: 'Processing',
            value: 'pending',
        },
        {
            label: 'Shipped',
            value: 'processing',
        },
        {
            label: 'Delivered',
            value: 'completed',
        },
        {
            label: 'Cancelled',
            value: 'cancelled',
        },
    ];
};

export function getOrderTotal(order: ResOrder) {
    const total = order.items.reduce((acc, product) => acc + product.variant1Price * product.variant1Qty + product.variant2Price * product.variant2Qty, 0);
    const fixed = total.toFixed(2);
    if (fixed.includes('.00')){
        return 'SGD ' + fixed.replace('.00', '');
    }
    return 'SGD ' + fixed;
}

export function getOrderStatus(order: ResOrder) {
    switch (order.orderStatus) {
        case 'pending':
            return 'Processing';
        case 'processing':
            return 'Shipped';
        case 'completed':
            return 'Delivered';
        case 'cancelled':
            if (order.paymentStatus === 'refunded') {
                return 'Refunded';
            }
            return 'Cancelled';
        default:
            return 'Unknown';

    }
}

export function nextStatusText(order: ResOrder) {
    switch (order.orderStatus) {
        case 'pending':
            return {
                label: 'To Ship',
                value: 'process',
            };
        case 'processing':
            return {
                label: 'To Deliver',
                value: 'complete',
            };
        default:
            return null;
    }
}

export function isActionable(order: ResOrder) {
    switch (order.orderStatus) {
        case 'pending':
            return true;
        case 'processing':
            return true;
        case 'completed':
            return true;
        case 'cancelled':
           if (isRefundable(order)) {
                return true;
           }
            return false;
        default:
            return false;
    }
}

export function isRefundable(order: ResOrder) {
    switch (order.orderStatus) {
        case 'pending':
            return false;
        case 'processing':
            return false;
        case 'completed':
            return false;
        case 'cancelled':
            if (order.paymentStatus === 'refunded') {
                return false;
            }
            // is order date is less than 30 days
            const orderDate = new Date(order.createdAt);
            const today = new Date();
            const diff = today.getTime() - orderDate.getTime();
            const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
            if (diffDays < 30) {
                return true;
            }
            return false;
        default:
            return false;
    }
}
