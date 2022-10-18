import type {NextPage} from 'next';
import {Header} from '../comps/header/header';
import {Cats} from '../comps/cats/cats';
import {CartSummery} from '../comps/cartsum/cart-summery';
import {useSnapshot} from 'valtio';
import {cartState} from '../states/cart';
import {CartItem} from '../comps/cartitem/cart-item';
import {useHasHydrated} from '../lib/utils';
import frontState from '../states/front';
import {Category} from '@prisma/client';
import {Background} from '../comps/background';
import {Banner} from '../comps/banner';
import {Container} from '../comps/container';
import Head from 'next/head';
import Link from 'next/link';


type Props = {
    categories: Category[];
}
const Cart: NextPage<Props> = () => {
    const {cart} = useSnapshot(cartState);
    const {searchContainerMargin} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();

    const {bannerA, bannerB, bannerC} = useSnapshot(frontState);

    return (
        <>
            <Header/>
            <Head>
                <title>
                    Cart - NeatKitch
                </title>
            </Head>
            <Container className="container search">
                <Cats/>
                <div style={{
                    marginLeft: hasHydrated ? searchContainerMargin : 0,
                    marginRight: hasHydrated ? searchContainerMargin : 0,
                }}>
                    <CartSummery/>
                    {
                        hasHydrated && !!(cart || []).length &&
                        <h3 className={'mt-4 fw-semibold'}>Cart Items</h3>
                    }
                    <div className={'mt-2'}>
                        {
                            hasHydrated && (cart || []).map(item => (
                                <CartItem key={item.product.id} cartItem={item}/>
                            ))
                        }
                        {
                            hasHydrated && (cart || []).length === 0 && (
                                <div className={'text-center'}>
                                    <h2 className={'text-center mt-5'}>Your cart is empty!</h2>
                                    <p className={'text-center'}>
                                        Looks like you haven't added anything to your cart yet.
                                    </p>
                                    <Link href={'/search'}>
                                        <a className={'btn btn-primary btn-lg mt-5'}>
                                            Continue Shopping
                                        </a>
                                    </Link>
                                </div>
                            )
                        }
                    </div>
                </div>

                <Background withMargin align={'right'} bg={'/static/images/right-bg.jpg'}/>
                <Banner align={'left'} bannerLarge={bannerA}/>
                <Banner align={'right'}
                        bannerTop={bannerB}
                        bannerBottom={bannerC}/>
            </Container>
        </>
    );
};

export default Cart;

