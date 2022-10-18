import {Order, OrderItem} from '@prisma/client';
import {CalculateDeliveryCost} from './delivery';


export async function computerOrderTotal(order: Order & {items: OrderItem[]}) {
    let price = 0;
    for (let orderItem of order.items) {
        price += orderItem.variant1Price * orderItem.variant1Qty + orderItem.variant2Price * orderItem.variant2Qty;
    }
    const shipping = await CalculateDeliveryCost(order);
    if (shipping) {
        return price + shipping;
    }
    return price;
}
