import {NextPage} from 'next';
import {Category} from '@prisma/client';
import {Header} from '../comps/header/header';
import {Container} from '../comps/container';
import {Cats} from '../comps/cats/cats';
import {formatPhoneNumber, useHasHydrated} from '../lib/utils';
import {Background} from '../comps/background';
import {Banner} from '../comps/banner';
import {useSnapshot} from 'valtio';
import frontState from '../states/front';
import userOrders, {OrderActions, OrderDisplayItem, TheOrder} from '../states/orders';
import {useEffect, useState} from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import {ResOrder} from '../lib/fetcher';
import {getImageUrl} from '../lib/config';
import {Loader} from '../comps/loader';
import Head from 'next/head';


type Props = {
    categories: Category[];
}

const Orders: NextPage<Props> = () => {
    const {bannerA, bannerB, bannerC} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();
    const {searchContainerMargin, windowWidth} = useSnapshot(frontState);

    useEffect(() => {

    }, []);

    return (
        <>
            <Header/>

            <Head>
                <title>
                    Orders - NeatKitch
                </title>
            </Head>
            <Container className="container orders">
                <Cats/>
                <div className={'mt-5'} style={{
                    marginLeft: hasHydrated ? searchContainerMargin : 0,
                    marginRight: hasHydrated ? searchContainerMargin : 0,
                }}>
                    <h1>My Orders</h1>
                    <OrderTable/>
                </div>
            </Container>
            <Background withMargin align={'right'} bg={'/static/images/right-bg.jpg'}/>

            {
                windowWidth > 1200 &&
                <>
                    <Banner align={'left'} bannerLarge={bannerA}/>
                    <Banner align={'right'}
                            bannerTop={bannerB}
                            bannerBottom={bannerC}/>
                </>
            }
        </>
    );
};

export default Orders;

const OrderTable = () => {
    const {orders, end} = useSnapshot(userOrders);
    useEffect(() => {
        OrderActions.init();

        return () => {
            OrderActions.empty();
        };

    }, []);

    if (!orders.length) {
        return null;
        // return <div className="text-center">No orders found</div>
    }

    return (
        <div>
            <InfiniteScroll
                pageStart={0}
                loadMore={() => {
                    OrderActions.expand();
                }}
                hasMore={!end}
                loader={
                    <Loader key={'loader'}/>
                }
            >
                {
                    orders.map((order) => (
                        <SingleOrder key={order.id} orderId={order.id}/>
                    ))
                }
            </InfiniteScroll>
        </div>
    );
};

const SingleOrder = ({orderId}: {orderId: number}) => {
    const [order, setOrder] = useState<ResOrder>();

    useEffect(() => {
        setOrder(OrderActions.getOrder(orderId));
    }, [orderId]);

    if (!order) {
        return null;
    }

    const theOrder = new TheOrder(order);

    return (
        <div className="single-order mb-4 pb-1 px-3 py-2 pe-4">
            <div className="row">
                <div className="col pe-0">
                    <OrderHeader order={theOrder}/>
                </div>
            </div>

            <div className={'row'}>
                <div className={'col-6'}>
                    <OrderInfo order={theOrder}/>
                </div>
                <div className={'col-6'}>
                    <OrderItems order={theOrder}/>
                </div>
            </div>
        </div>
    );
};

const OrderHeader = ({order}: {order: TheOrder}) => {
    return (
        <div className="order-header ms-0">
            <div className={'id fw-bold'}>Order #{order.id}</div>
            <div>{order.orderDate}</div>
            <div className={'fw-bold status '
            + order.statusColor
            }>{order.orderStatus}</div>
        </div>
    );
};

const OrderInfo = ({order}: {order: TheOrder}) => {
    return (
        <div className="order-info">
            {/*<div className="inner">*/}
            {/*<h4>Address</h4>*/}
            <p>{order.name}</p>
            <p>
                {order.address.addrLine1}{order.address.addrLine2 && ','} {order.address.addrLine2}<br/>
                {order.address.city}, {order.address.state}<br/> {order.address.zip}
            </p>
            <p>{formatPhoneNumber(order.phone)}</p>
            {/*</div>*/}
        </div>
    );
};

const OrderItems = ({order}: {order: TheOrder}) => {
    return (
        <div className="order-items">
            {
                order.items.map((item, index) => (
                    <OrderItem key={index} item={item}/>
                ))
            }
        </div>
    );
};

const OrderItem = ({item}: {item: OrderDisplayItem}) => {
    return (
        <div className="order-item row justify-content-between">
            <div className="left col-auto">
                <div className={'image'}>
                    {
                        item.imageId &&
                        <img src={getImageUrl(item.imageId)} alt={item.productName}/>
                    }
                </div>
                <div className={'names'}>
                    <div className={'pr-name'}>{item.productName}</div>
                    <span className={'var-name'}>{item.varName}</span>
                </div>
            </div>
            <div className="right col-auto">
                <p><span className={'opacity-50'}>Qty:</span> {item.varQty}</p>
                <p>SGD {item.varPrice}</p>
            </div>
        </div>
    );
};
