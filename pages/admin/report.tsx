import {NextPage} from 'next';
import React from 'react';
import AdminLayout from '../../layouts/admin';
import {Category, Order} from '@prisma/client';
import {prisma} from '../../prisma';
import {OrderItem} from '@prisma/client';


interface Props {
    processingOrderCount,
    pendingOrderCount,
    mostOrderedProductsTopProducts,
    mostOrderedProductsWeekTopProducts,
    orderCountMonth,
    orderCountYear,
    orderCountWeek,
    mostOrderedProductsWithOrderCount,
    mostOrderedProductsWeekWithOrderCount,

    [key: string]: any
}


const SingleCard = ({title, value, type}: {title: string, value: any, type?: 1 | 2}) => {

    if (type === undefined) {
        type = 1;
    }

    if (type === 1) {
        return (
            <div className={'col-4 card card-body '}>
                <div className={'bg-secondary bg-opacity-10 m-2 py-2 px-3 rounded'}>
                    <div className={'d-flex justify-content-between align-items-center'}>
                    <span className={'m-0 fw-normal text-black d-block'} style={{
                        fontSize: '1.1rem'
                    }}>{title}</span>
                        <span className={'m-0 ms-2 py-1 px-3 fw-normal rounded-4 d-block bg-secondary bg-opacity-25'} style={{
                            fontSize: '1.3rem',
                        }}>{value}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={'col-3 card card-body '}>
            <div className={'bg-secondary bg-opacity-10 m-2 py-2 px-3 rounded-4'}>
                <div className={'d-flex justify-content-between align-items-center'}>
                    <span className={'m-0 text-black d-block'} style={{
                        // fontSize: '1.1rem'
                        fontWeight: 500
                    }}>{title}</span>
                    <span className={'m-0 ms-2 py-1 px-3 rounded-4 d-block'} style={{
                        // fontSize: '1.3rem',
                        fontWeight: 500
                    }}>{value}</span>
                </div>
            </div>
        </div>
    );
};

const Report: NextPage<Props> = (props) => {


    return (
        <AdminLayout>
            <div className="container ms-0" style={{
                fontSize: '1.05rem',
                fontWeight: 'bold',
                maxWidth: '1050px',
            }}>
                <h1>Report</h1>
                <div style={{
                    borderBottom: '1px solid #ccc',
                    marginBottom: '1rem',
                }}/>
                <div className="row">
                    <SingleCard title={'Total number of Orders'} value={props.orderCountMonth}/>
                    <SingleCard title={'Processing Orders'} value={props.processingOrderCount + props.pendingOrderCount}/>
                    {/*<SingleCard title={'Pending Orders'} value={props.pendingOrderCount}/>*/}
                    <SingleCard title={'Cancelled Orders'} value={props.cancelledOrderCount}/>
                    <SingleCard title={'Delivered Orders'} value={props.completedOrderCount}/>
                </div>

                <h2 className={'mt-5 fw-semibold'}>Most ordered products</h2>
                <div className="">
                    {props.mostOrderedProductsWithOrderCount.map(product => (
                        <SingleCard type={2} title={product.name} value={product.count + ' Orders'}/>
                    ))}
                </div>

                {/*<h2 className={'mt-5'}>Most ordered products (week)</h2>*/}
                {/*<table className="table table-striped">*/}
                {/*    <thead>*/}
                {/*    <tr>*/}
                {/*        <th>Product</th>*/}
                {/*        <th>Count</th>*/}
                {/*    </tr>*/}
                {/*    </thead>*/}
                {/*    <tbody>*/}
                {/*    {props.mostOrderedProductsWeekWithOrderCount.map(product => (*/}
                {/*        <tr key={product.id}>*/}
                {/*            <td>{product.name}</td>*/}
                {/*            <td>{product.count}</td>*/}
                {/*        </tr>*/}
                {/*    ))}*/}
                {/*    </tbody>*/}
                {/*</table>*/}

            </div>
        </AdminLayout>
    );
};

export default Report;

export const getServerSideProps = async () => {

    // no of orders purchased this month
    const orderCountMonth = await prisma.order.count({
        where: {
            createdAt: {
                gte: new Date(new Date().setDate(1)),
            },
        },
    });

    // no of orders purchased this year
    const orderCountYear = await prisma.order.count({
        where: {
            createdAt: {
                gte: new Date(new Date().setMonth(0)),
            },
        },
    } as any);

    // no of orders purchased this week
    const orderCountWeek = await prisma.order.count({
        where: {
            createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
            },
        },
    } as any);

    // most ordered products of this month
    const mostOrderedProducts = await prisma.orderItem.findMany({
        where: {
            order: {
                createdAt: {
                    gte: new Date(new Date().setDate(1)),
                },
            },
        },
    });
    const mostOrderedProductsMap = new Map();
    mostOrderedProducts.forEach((orderItem: OrderItem) => {
        if (mostOrderedProductsMap.has(orderItem.productId)) {
            mostOrderedProductsMap.set(orderItem.productId, mostOrderedProductsMap.get(orderItem.productId) + 1);
        } else {
            mostOrderedProductsMap.set(orderItem.productId, 1);
        }
    });
    const mostOrderedProductsArray: [number, number][]
        = Array.from(mostOrderedProductsMap.entries());
    mostOrderedProductsArray.sort((a, b) => b[1] - a[1]);
    const mostOrderedProductsTop = mostOrderedProductsArray.slice(0, 3);
    const mostOrderedProductsTopIds = mostOrderedProductsTop.map(([id]) => id);
    const mostOrderedProductsTopProducts = await prisma.product.findMany({
        where: {
            id: {
                in: mostOrderedProductsTopIds,
            },
        },
    });
    const mostOrderedProductsWithOrderCount = mostOrderedProductsTopProducts.map(product => ({
        ...product,
        count: mostOrderedProductsMap.get(product.id),
    } as any));

    // most ordered products of this week
    const mostOrderedProductsWeek = await prisma.orderItem.findMany({
        where: {
            order: {
                createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                },
            },
        },
    });
    const mostOrderedProductsWeekMap = new Map();
    mostOrderedProductsWeek.forEach((orderItem: OrderItem) => {
        if (mostOrderedProductsWeekMap.has(orderItem.productId)) {
            mostOrderedProductsWeekMap.set(orderItem.productId, mostOrderedProductsWeekMap.get(orderItem.productId) + 1);
        } else {
            mostOrderedProductsWeekMap.set(orderItem.productId, 1);
        }
    });
    const mostOrderedProductsWeekArray: [number, number][]
        = Array.from(mostOrderedProductsWeekMap.entries());
    mostOrderedProductsWeekArray.sort((a, b) => b[1] - a[1]);
    const mostOrderedProductsWeekTop = mostOrderedProductsWeekArray.slice(0, 3);
    const mostOrderedProductsWeekTopIds = mostOrderedProductsWeekTop.map(([id]) => id);
    const mostOrderedProductsWeekTopProducts = await prisma.product.findMany({
        where: {
            id: {
                in: mostOrderedProductsWeekTopIds,
            },
        },
    });
    const mostOrderedProductsWeekWithOrderCount = mostOrderedProductsWeekTopProducts.map(product => ({
        ...product,
        count: mostOrderedProductsWeekMap.get(product.id),
    } as any));

    // remove date in products
    mostOrderedProductsTopProducts.forEach((product: any) => {
        delete product.createdAt;
        delete product.updatedAt;
    });
    mostOrderedProductsWeekTopProducts.forEach((product: any) => {
        delete product.createdAt;
        delete product.updatedAt;

    });
    mostOrderedProductsWithOrderCount.forEach((product: any) => {
        delete product.createdAt;
        delete product.updatedAt;
    });
    mostOrderedProductsWeekWithOrderCount.forEach((product: any) => {
        delete product.createdAt;
        delete product.updatedAt;
    });

    // number of processing and pending orders
    const processingOrderCount = await prisma.order.count({
        where: {
            metas: {
                some: {
                    key: 'order_status',
                    value: 'processing',
                },
            },
        },
    });
    const pendingOrderCount = await prisma.order.count({
        where: {
            metas: {
                some: {
                    key: 'order_status',
                    value: 'pending',
                },
            },
        },
    });
    const completedOrderCount = await prisma.order.count({
        where: {
            metas: {
                some: {
                    key: 'order_status',
                    value: 'completed',
                }
            }
        }
    });
    const cancelledOrderCount = await prisma.order.count({
        where: {
            metas: {
                some: {
                    key: 'order_status',
                    value: 'cancelled',
                }
            }
        }
    })

    // day by day order count this month
    // const dayByDayOrderCountMonth = await prisma.order.findMany({
    //     where: {
    //         createdAt: {
    //             gte: new Date(new Date().setDate(1)),
    //         }
    //     },
    //     select: {
    //         createdAt: true,
    //     }
    // } as any);
    // const dayByDayOrderCountMonthMap = new Map();
    // dayByDayOrderCountMonth.forEach((order: Order) => {
    //     const date = order.createdAt.getDate();
    //     if (dayByDayOrderCountMonthMap.has(date)) {
    //         dayByDayOrderCountMonthMap.set(date, dayByDayOrderCountMonthMap.get(date) + 1);
    //     } else {
    //         dayByDayOrderCountMonthMap.set(date, 1);
    //     }
    // });
    // const dayByDayOrderCountMonthArray: [number, number][]
    //     = Array.from(dayByDayOrderCountMonthMap.entries());
    // dayByDayOrderCountMonthArray.sort((a, b) => b[1] - a[1]);

    // day 1 - day 30
    // const dayByDayOrderCountMonthA: [number, number][]


    const props = {
        processingOrderCount,
        pendingOrderCount,
        completedOrderCount,
        cancelledOrderCount,
        mostOrderedProductsTopProducts,
        mostOrderedProductsWeekTopProducts,
        orderCountMonth,
        orderCountYear,
        orderCountWeek,
        mostOrderedProductsWithOrderCount,
        mostOrderedProductsWeekWithOrderCount,
    };

    return {
        props,
    };
};
