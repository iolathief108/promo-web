import type {NextPage} from 'next';
import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';
import {Fetcher} from '../../lib/fetcher';
import {PaymentStatusKey} from '../../services/order-meta';
import {Header} from '../../comps/header/header';
import {Cats} from '../../comps/cats/cats';
import {cartActions} from '../../states/cart';
import {Container} from '../../comps/container';
import {useHasHydrated} from '../../lib/utils';
import {useSnapshot} from 'valtio';
import frontState from '../../states/front';
import {Background} from '../../comps/background';
import {Banner} from '../../comps/banner';
import {useIsLoggedIn} from '../../states/profile';


const OrderSuccess: NextPage = () => {
    const [success, setSuccess] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const {windowWidth} = useSnapshot(frontState);

    const {bannerA, bannerB, bannerC} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();
    const isLoggedIn = useIsLoggedIn();

    const {query} = useRouter();
    const {order_id} = query;

    useEffect(() => {

        cartActions.clear();
        // run clear after 2 seconds
        setTimeout(() => {
            cartActions.clear();
        }, 2000);
        setTimeout(() => {
            cartActions.clear();
        }, 1000);

        // is order id is number
        if (order_id && !isNaN(Number(order_id))) {
            Fetcher.post('/order/status', {
                meta: PaymentStatusKey,
                orderId: Number(order_id),
            }).then(() => {
                setSuccess(true);
                setLoaded(true);
                cartActions.clear();
            }).catch(() => {
                // redirect to home
                // window.location.href = '/';
            });
        } else {
            // redirect to home
            // window.location.href = '/';

            // setSuccess(false);
            setLoaded(true);
        }

    }, [query]);

    if (isLoggedIn === false && hasHydrated) {
        // redirect to home
        window.location.href = '/';
    }

    if (!success || !loaded) {
        return null;
    }

    if (!isLoggedIn) {
        return null;
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
                    <img width={100} src="/sp-guid.png" alt="order failed"/>
                    <h1 className={'mt-4'}>Your Payment is Successfull</h1>
                    <p>
                        Thank you for your purchase. We recieved your order. We will be in touch with you shortly.
                    </p>
                    <a href="/">
                        <button className="btn btn-primary text-success">
                            <i className="fa fa-home "/> Back to Home
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

export default OrderSuccess;

