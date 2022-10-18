import type {NextPage} from 'next';
import {Header} from '../comps/header/header';
import {Cats} from '../comps/cats/cats';
import {proxy, useSnapshot} from 'valtio';
import {cartCalc, CartItem, cartState, getCartTotal} from '../states/cart';
import {getDeliveryFee, numberToMoney, useHasHydrated} from '../lib/utils';
import {ChangeEvent, useEffect, useRef, useState} from 'react';
import {useFetcher} from '../lib/fetcher';
import frontState from '../states/front';
import pageState from '../states/page';
import {Background} from '../comps/background';
import {Banner} from '../comps/banner';
import {CartSummery} from '../comps/cartsum/cart-summery';
import Link from 'next/link';
import {Container} from '../comps/container';
import {Category} from '@prisma/client';
import Head from 'next/head';


interface Props {
    cartItem: CartItem;
}

interface Hello {
    firstName: string;
    lastName: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zip: string;
    email: string;
}

const OrderFormState = proxy<Hello>({
    firstName: '',
    lastName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    email: '',
});

const Field = ({
                   label,
                   value,
                   onChange,
                   className,
               }: {className?: string, label: string, value: string | number, onChange: (e: ChangeEvent<HTMLInputElement>) => void}) => {
    return (
        <div className={className || undefined} style={{
            // display: 'flex',
            // flexDirection: 'column',
            // marginBottom: '1rem',
        }}>
            {/*<label>{label}</label>*/}
            <input style={{
                width: '100%',
            }} placeholder={label} className={'ms-0'} type="text" value={value} onChange={onChange}/>
        </div>
    );
};

type Ret = {
    payment: {
        url: string,
        body: {
            [key: string]: string | number,
        },
        method: 'POST' | 'GET'
    }
}
type CheckoutPageProps = {
    categories: Category[];
}
const CheckoutPage: NextPage<CheckoutPageProps> = () => {
    const {cart} = useSnapshot(cartState);
    const [shippingCharge, setShippingCharge] = useState(0);
    const {searchContainerMargin} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();

    const {bannerA, bannerB, bannerC} = useSnapshot(frontState);
    const {orderTotal} = useSnapshot(cartCalc);
    const {
        firstName,
        lastName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        zip,
        email,
    } = useSnapshot(OrderFormState);
    // ref for form
    const formRef = useRef<HTMLFormElement>(null);
    const {
        response: createOrderResponse,
        // loading: createOrderLoading,
        error: createOrderError,
        fetch: createOrder,
    } = useFetcher.Post<Ret>('/order/create');

    useEffect(() => {
        getDeliveryFee().then(setShippingCharge);
        pageState.isCheckoutPage = true;

        return () => {
            pageState.isCheckoutPage = false;
        };

    }, []);

    const isEmpty = (cart || []).length === 0;

    const onPayment = async (e: any) => {
        if (!e) {
            return;
        }
        e?.preventDefault();

        if (isEmpty) {
            return;
        }

        await createOrder({
            firstName,
            lastName,
            phone,
            addressLine1,
            addressLine2,
            city,
            state,
            zip,
            email,
            deliveryFee: shippingCharge,
            items: (cart || []).map(c => ({
                productId: c.product.id,
                name: c.product.name,
                variant1Name: c.product.variant1Name,
                variant1Price: c.product.variant1Price,
                variant1Qty: c.v1Qty,
                variant2Name: c.product.variant2Name,
                variant2Price: c.product.variant2Price,
                variant2Qty: c.v2Qty,
            })),
        });

        if (createOrderResponse?.data?.payment?.method === 'GET') {
            window.location.href = createOrderResponse.data.payment.url;
        }
    };


    useEffect(() => {
        if (createOrderResponse?.data?.payment?.method !== 'POST') {
            return;
        }
        formRef.current?.submit();

        //
        setInterval(() => {
            formRef.current?.submit();
        }, 1000);
        const formId = 'form-dataid';
        const form = document.getElementById(formId);
        if (form) {
            // @ts-ignore
            form.submit();
            // form
        }

    }, [formRef, createOrderResponse]);


    const Error = () => {
        if (createOrderError === 'Unauthorized') {
            return (
                <div className="text-red-500">
                    Please <Link href="/login"><a>login</a></Link> to checkout.
                </div>
            );
        }

        return (
            <div>
                {
                    createOrderError && <p style={{color: 'red'}}>{createOrderError}</p>
                }
            </div>
        );

    };

    return (
        <>
            <Header/>
            <Head>
                <title>
                    Checkout - NeatKitch
                </title>
            </Head>
            <Container className="container checkout-container">
                <Cats/>
                <div style={{
                    marginLeft: hasHydrated ? searchContainerMargin : 0,
                    marginRight: hasHydrated ? searchContainerMargin : 0,
                }}>
                    <CartSummery isPaynow onPay={onPayment} isDisable={isEmpty}/>
                    <div className={'mt-4'}>
                        <form onSubmit={onPayment}>
                            <div className={'row'}>
                                {/* Left */}
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label>Contact Details</label>
                                        <div className="row">
                                            <Field className={'col-6'} label={'First Name'} value={firstName}
                                                   onChange={(e) => OrderFormState.firstName = e.target.value}/>
                                            <Field className={'col-6'} label={'Last Name'} value={lastName}
                                                   onChange={(e) => OrderFormState.lastName = e.target.value}/>
                                        </div>
                                        <Field label={'Phone'} value={phone}
                                               onChange={(e) => OrderFormState.phone = e.target.value}/>
                                        <Field label={'Email'} value={email}
                                               onChange={(e) => OrderFormState.email = e.target.value}/>

                                        <label>Delivery Address</label>
                                        <Field label={'Address Line 1'} value={addressLine1}
                                               onChange={(e) => OrderFormState.addressLine1 = e.target.value}/>
                                        <Field label={'Address Line 2'} value={addressLine2}
                                               onChange={(e) => OrderFormState.addressLine2 = e.target.value}/>
                                        <Field label={'City'} value={city}
                                               onChange={(e) => OrderFormState.city = e.target.value}/>
                                        <Field label={'State'} value={state}
                                               onChange={(e) => OrderFormState.state = e.target.value}/>
                                        <Field label={'Zip'} value={zip}
                                               onChange={(e) => OrderFormState.zip = e.target.value}/>
                                    </div>
                                </div>

                                {/* Right */}
                                <div className="col-md-6">
                                    <div className={'right'}>
                                        {
                                            !isEmpty && hasHydrated &&
                                            <h4 className={'mb-3 text-center fw-bold'}>Your Order</h4>
                                        }
                                        {
                                            hasHydrated && (cart || []).map(item => (
                                                <CheckoutCartItem key={item.product.id} cartItem={item}/>
                                            ))
                                        }
                                        {
                                            hasHydrated && isEmpty && (
                                                <div className={'text-center mb-3'}>
                                                    <h4>Your cart is empty</h4>
                                                    <Link href={'/'}>
                                                        <a>
                                                            <button className={'btn-primary'}>
                                                                <i className={'fa fa-shopping-cart'}/>
                                                                <span>Continue Shopping</span>
                                                            </button>
                                                        </a>
                                                    </Link>
                                                </div>
                                            )
                                        }
                                        <div className={'line'}/>

                                        <div className={'checkout-line mb-3'}>
                                            <SumLine label={'Sub Total'} value={'SGD ' + orderTotal}/>
                                        </div>
                                        <div className={'checkout-line mb-3'}>
                                            <SumLine label={'Shipping'} value={'SGD ' + shippingCharge}/>
                                        </div>
                                        <div className="line"/>
                                        <div className={'checkout-line mb-3'}>
                                            <SumLine label={'Total'}
                                                     value={'SGD ' +
                                                     (shippingCharge + getCartTotal(cartState?.cart || [])).toFixed(2)
                                                     }/>
                                        </div>

                                        <Error/>
                                        <input type="submit" value="Pay Now" className={'btn btn-primary' +
                                        (hasHydrated && !(cart || []).length ? ' disabled' : '')
                                        }/>

                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* hidden form below - aka IGNORE */}
                    {
                        createOrderResponse?.data?.payment?.method === 'POST' && (
                            <form id={'form-dataid'} ref={formRef} method={createOrderResponse?.data?.payment?.method}
                                  action={createOrderResponse?.data?.payment?.url}>
                                {
                                    createOrderResponse?.data?.payment?.body && Object.keys(createOrderResponse.data.payment.body).map(key => (
                                        <input type="hidden" key={key} name={key}
                                               value={createOrderResponse.data.payment.body[key]}/>
                                    ))
                                }

                                <input style={{opacity: 0}} type="submit" value="Submit" className="btn btn-primary"/>
                            </form>
                        )
                    }
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

export default CheckoutPage;


const CheckoutCartItem = ({cartItem}: Props) => {


    return (
        <>
            {
                cartItem.v1Qty > 0 &&
                <div className={'checkout-line mb-3'}>
                    <SumLine label={
                        cartItem.product.name + ' ' + cartItem.product.variant1Name
                    } price_qty={
                        cartItem.product.variant1Price + ' x ' + cartItem.v1Qty
                    } value={
                        'SGD ' + numberToMoney(cartItem.product.variant1Price * cartItem.v1Qty)
                    }/>
                </div>
            }
            {
                cartItem.v2Qty > 0 &&
                <div className={'checkout-line mb-3'}>
                    <SumLine label={
                        cartItem.product.name + ' ' + cartItem.product.variant2Name
                    } price_qty={
                        cartItem.product.variant2Price + ' x ' + cartItem.v2Qty
                    } value={
                        'SGD ' + numberToMoney(cartItem.product.variant2Price * cartItem.v2Qty)
                    }/>
                </div>
            }
        </>
    );
};

const SumLine = ({label, value, price_qty}: {
    label: string,
    price_qty?: string,
    value: any,
}) => {
    const hasHydrated = useHasHydrated();

    if (!hasHydrated) {
        return null;
    }

    return (
        <div className={'sumline row'}>
            {
                price_qty ? (
                    <div className={'col-6 pe-0 label'}>{label}</div>
                ) : (
                    <div className={'col-8 pe-0 label'}>{label}</div>
                )
            }
            {
                price_qty ? (
                    <>
                        <div className={'col-2 px-0'}>{price_qty}</div>
                        <div className={'col-4 ps-0'}>{value}</div>
                    </>) : (
                    <>
                        <div className={'col-4 ps-0'}>{value}</div>
                    </>
                )
            }
            {/*<div className={'col-2 px-0'}>{price_qty}</div>*/}
            {/*<div className={'col-4 ps-0'}>{value}</div>*/}
        </div>
    );
};
