import type {NextPage} from 'next';
import AdminLayout from '../../layouts/admin';
import adminOrders, {
    AdminOrderActions,
    getAllOrderStatus,
    getOrderStatus, getOrderTotal, isActionable, isRefundable,
    nextStatusText,
} from '../../states/admin-orders';
import {useSnapshot} from 'valtio';
import {useEffect, useRef, useState} from 'react';
import moment from 'moment';
import {OrderItem} from '@prisma/client';
import {getImageUrl} from '../../lib/config';
import {searchActions} from '../../states/search';
import Popup from 'reactjs-popup';
import {ResOrder} from '../../lib/fetcher';
import {OrderDisplayItem, TheOrder} from '../../states/orders';
import {formatPhoneNumber} from '../../lib/utils';
import ReactToPrint from 'react-to-print';


const Orders: NextPage = () => {

    useEffect(() => {
        AdminOrderActions.init();
    }, []);

    return (
        <AdminLayout>
            <div className="container admin-order ms-0">
                <h1 className={'mb-2'}>Orders</h1>

                <div>
                    <FilterBar/>
                    <OrdersTable/>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Orders;

function FilterBar() {
    return (
        <div>
            <OrderStatusFilter/>
        </div>
    );
}

function OrderStatusFilter() {
    const onLinkClick = (e, statusKey) => {
        e.preventDefault();
        AdminOrderActions.filter(statusKey);
    };
    const {filter} = useSnapshot(adminOrders);

    return (
        <div className={'filter'}>
            <div className="row">
                {
                    getAllOrderStatus().map(status => (
                        <div className={
                            'col-sm-auto' + (status.value === filter ? ' active' : '')
                        } key={status.value}>
                            {
                                <a onClick={e => onLinkClick(e, status.value)}>
                                    {status.label}
                                </a>
                            }
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

function OrdersTable() {
    const {orders} = useSnapshot(adminOrders);

    return (
        <div>
            <TableHead/>
            {
                orders.map(order => (
                    <Order key={order.id} orderId={order.id}/>
                ))
            }
            <Pagination/>
        </div>
    );
}

function Order({orderId}) {

    const {orders} = useSnapshot(adminOrders);
    const [order, setOrder] = useState<ResOrder>();
    const [actionOpen, setActionOpen] = useState(false);
    const orderDetailRef = useRef(null);

    useEffect(() => {
        // @ts-ignore
        setOrder(orders.find(o => o.id === orderId));
    }, [orders, orderId]);

    if (!order) {
        return null;
    }

    return (
        <div className={'order'}>
            <div className={'row'}>
                <div className={'id'}>
                    {order.id}
                </div>
                <div className={'name'}>
                    <Popup
                        className={'order-popup'}
                        // defaultOpen={orderId === 30}
                        trigger={
                            <a className={'name-a'}>
                                {order.firstName + ' ' + order.lastName}
                            </a>
                        } modal>
                        <div>
                            <div ref={orderDetailRef}>
                                <OrderDetail order={new TheOrder(order)}/>
                            </div>
                            <ReactToPrint
                                trigger={() => <a className={'ps-3 pb-2 d-inline-block fw-bold'}>PRINT OUT</a>}
                                content={() => orderDetailRef.current}
                            />
                        </div>
                    </Popup>
                </div>
                <div className={'date'}>
                    {
                        moment(order.createdAt).fromNow()
                    }
                </div>
                <div className={'total'}>
                    {getOrderTotal(order)}
                </div>
                <div className={'status'}>
                    {getOrderStatus(order)}
                </div>
                <div className={'actions'}>
                    <button disabled={!isActionable(order)} onClick={() => setActionOpen(!actionOpen)}>
                        Action
                        <div className={
                            'action' + (actionOpen && isActionable(order) ? ' open' : '')
                        }>
                            {
                                nextStatusText(order) ? (
                                    <button onClick={() => AdminOrderActions.execute(order.id)}>
                                        {nextStatusText(order)?.label}
                                    </button>
                                ) : null
                            }
                            {
                                order.orderStatus !== 'cancelled' ? (
                                    <button className={'bg-danger text-white'}
                                            onClick={() => AdminOrderActions.cancel(order.id)}>
                                        Cancel
                                    </button>
                                ) : null
                            }
                            {
                                isRefundable(order) && (
                                    <button className={'bg-warning text-white'}
                                            onClick={() => AdminOrderActions.refund(order.id)}>
                                        Refund
                                    </button>
                                )
                            }

                            <div onClick={() => {
                                setActionOpen(false);
                            }} className={'alpha'}/>
                        </div>
                    </button>
                </div>
            </div>
            {/*<ProductList items={order.items}/>*/}
        </div>
    );
}

function TableHead() {
    return (
        <div className={'table-head'}>
            <div className={'row'}>
                <div className={'id'}>
                    ID
                </div>
                <div className={'name'}>
                    Name
                </div>
                <div className={'date'}>
                    Date
                </div>
                <div className={'total'}>
                    Total
                </div>
                <div className={'status'}>
                    Status
                </div>
                <div className={'actions'}>
                    Actions
                </div>
            </div>
        </div>
    );
}

function Pagination() {
    const {currentPage, totalPage} = useSnapshot(adminOrders);

    const handleClick = (e, page) => {
        e.preventDefault();
        AdminOrderActions.paginate(page);
    };

    return (

        <div className={'pagination mb-6 mt-5 align-center d-flex justify-content-center'}>
            {currentPage > 1 && (
                <button className={'btn btn-primary'} onClick={() => AdminOrderActions.prevPage()}>
                    Previous
                </button>
            )}
            {Array.from({length: totalPage}, (_, i) => (
                <button className={'btn btn-primary '
                + (currentPage === i + 1 ? 'active' : '')
                } onClick={() => AdminOrderActions.paginate(i + 1)} key={i}>
                    {i + 1}
                </button>
            ))}
            {currentPage < totalPage && (
                <button className={'btn btn-primary'} onClick={() => AdminOrderActions.nextPage()}>
                    Next
                </button>
            )}
        </div>

    );
}

function ProductList(props: {items: (OrderItem & {product: {imageId: number} | null})[]}) {


    return (
        <div className={'item-list'}>
            <div className="row">
                {
                    props.items.map(item => (
                        <>
                            {
                                item.variant1Qty > 0 && (
                                    <Product key={`${item.id}v1`} variationName={item.variant1Name}
                                             qty={item.variant1Qty}
                                             imageId={item.product?.imageId}
                                    />
                                )
                            }
                            {
                                item.variant2Qty > 0 && (
                                    <Product key={`${item.id}v2`} variationName={item.variant2Name}
                                             qty={item.variant2Qty}
                                             imageId={item.product?.imageId}
                                    />
                                )
                            }
                        </>
                    ))
                }
            </div>
        </div>
    );
}

function Product(props: {variationName: string, imageId?: number, qty: number}) {
    return (
        <div className={'item col-auto'}>
            <div className="qty">
                {
                    props.qty + 'x'
                }
            </div>
            <div className={'image'}>
                {
                    props.imageId && (
                        <img src={getImageUrl(props.imageId)} alt={props.variationName}/>
                    )
                }
                {
                    props.variationName && (
                        <div className={'var-name text-center'}>
                            {props.variationName}
                        </div>
                    )
                }
            </div>
            {/*{*/}
            {/*    props.item && props.item.product?.imageId && (*/}
            {/*        <img src={*/}
            {/*            getImageUrl(props.item.product?.imageId)*/}
            {/*        } alt={props.item.name}/>*/}
            {/*    )*/}
            {/*}*/}
        </div>
    );
}

function OrderDetail({order}: {order: TheOrder}) {

    const Summary = () => {

        return (
            <div className={'summary'}>
                <h4>Summary</h4>
                {/*<span className={'d-block'}>Order ID: {order.id}</span>*/}
                <span className={'order-time opacity-50'}>
                    Placed on {moment(order.order.createdAt).format('MMM DD, YYYY hh:mm a')}
                </span>

                <div className={'mt-4'}>
                    <div className={'d-flex justify-content-between'}>
                        <span>Subtotal</span>
                        <span>SGD {order.subtotal}</span>
                    </div>
                    <div className={'d-flex justify-content-between'}>
                        <span>Shipping</span>
                        <span>SGD {order.order.deliveryFee}</span>
                    </div>
                    <div className={'border-line mb-2'}/>
                    <div className={'d-flex justify-content-between'}>
                        <span>Total</span>
                        <span className={'fw-bolder'}>SGD {order.total}</span>
                    </div>
                </div>
            </div>
        );
    };

    const Address = () => {
        return (
            <div className={'address'}>
                <h4>Address</h4>
                <p>{order.name}</p>
                <p>
                    {order.address.addrLine1}{order.address.addrLine2 && ','} {order.address.addrLine2}<br/>
                    {order.address.city}, {order.address.state}<br/> {order.address.zip}
                </p>
                <p>{formatPhoneNumber(order.phone)}</p>
            </div>
        );
    };

    const Items = () => {
        return (
            <div className={'value'}>
                <h4>Items</h4>
                {
                    order.items.map((item, index) => (
                        <TheOrderItem key={`${index}-${item.productName}-${item.varName}`} item={item}/>
                    ))
                }
            </div>
        );
    };

    return (
        <div className={'container or-det-cont px-4 pt-4 pb-3'}>
            <h2>Order # {order.id}</h2>

            <div className={'row '}>
                <div className={'frame col-6 p-3'}>
                    <Summary/>
                </div>
                <div className={'frame frame-2 flex-grow-1 p-3'}>
                    <Address/>
                </div>
            </div>

            <div className={'frame frame-3 row pt-3 mb-2'}>
                <Items/>
            </div>
        </div>
    );
}


const TheOrderItem = ({item}: {item: OrderDisplayItem}) => {
    return (
        <div className="order-item row py-2">
            <div className={'col-2'}>
                {
                    item.imageId &&
                    <img style={{
                        width: '100%',
                        objectFit: 'contain',
                    }}
                         src={getImageUrl(item.imageId)} alt={item.productName}/>
                }
            </div>
            <div className={'col-3'}>
                <div className={'pr-name'}>{item.productName}</div>
                <span className={'var-name opacity-50'}>{item.varName}</span>
            </div>
            <div className="col-3">
                <p>SGD {item.varPrice}
                    <br/> <span className={'opacity-50'}>Qty:</span> {item.varQty}</p>
            </div>
            <div className="col-1">
                <input style={{
                    transform: 'scale(1.3)',
                }} type={'checkbox'}/>
            </div>
            <div className="col-auto fw-bold ms-auto text-end">
                {/*<p>SGD {item.varPrice}</p>*/}
                <p>SGD {item.varPrice * item.varQty}</p>
            </div>
        </div>
    );
};
