import type {NextPage} from 'next';
import {useRouter} from 'next/router';
import {useEffect} from 'react';
import {Fetcher} from '../../lib/fetcher';
import {Header} from '../../comps/header/header';
import {Cats} from '../../comps/cats/cats';
import frontState from '../../states/front';
import {Container} from '../../comps/container';
import {useHasHydrated} from '../../lib/utils';
import {Background} from '../../comps/background';
import {Banner} from '../../comps/banner';
import {useSnapshot} from 'valtio';
import {useIsLoggedIn} from '../../states/profile';


const OrderFailed: NextPage = () => {
    const {query} = useRouter();
    const {order_id} = query;

    const {windowWidth} = useSnapshot(frontState);
    const isLoggedIn = useIsLoggedIn();

    const {bannerA, bannerB, bannerC} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();

    useEffect(() => {
        if (!order_id || typeof order_id !== 'string' || isNaN(parseInt(order_id))) {
            return;
        }
        Fetcher.post('/order/failed', {
            key: 'order_payment_failed',
            orderId: parseInt(order_id),
        }).then(() => {
            console.log('order payment failed');
        }).catch((e) => {
            console.log(e);
        });
    }, [query]);


    if (!isLoggedIn && hasHydrated) {
        // redirect to home
        setTimeout(() => {
            if (!isLoggedIn) {
                window.location.href = '/';
            }
        } , 1500);

        if (!isLoggedIn) {
            return null;
        }
    }


    return (
        <>
            <Header/>
            <Container className="container search">
                <Cats/>
                <div className={'mt-7 text-center'} style={{
                    // marginLeft: hasHydrated ? searchContainerMargin : 0,
                    // marginRight: hasHydrated ? searchContainerMargin : 0,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    maxWidth: '500px',
                }}>
                    <img width={100} src="/sf-guid.png" alt="order failed"/>
                    <h1 className={'mt-4'}>Sorry, payment failed!</h1>
                    <p>
                        Unfortunately, your order # {order_id} failed.
                    </p>
                    <p>
                        Please try again or contact us for assistance.
                    </p>
                    <a href="/">
                        <button className="btn btn-primary text-danger">
                            <i className="fa fa-home "/> Home
                        </button>
                    </a>
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

export default OrderFailed;

