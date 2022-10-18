import {NextPage, NextPageContext} from 'next';
import {useEffect, useState} from 'react';
import axios from 'axios';


const Test_payment: NextPage<any> = (props) => {
    const [error, setError] = useState<string | false>(false);

    useEffect(() => {
        // replace link to prevent back button
        window.history.replaceState({}, document.title, 'test_payment_2');
        window.history.replaceState({}, document.title, 'test_payment_3');

    }, []);

    if (!props.order_id) {
        return null;
    }

    return (
        <div className={'container'}>
            <h1>X Bank payment Gateway</h1>
            <div className={'container'}>
                <input type="text" name="api_url" placeholder={'Hello World!'}/><br/>
                <input type="text" name="api_key" placeholder={'Hello World!'}/><br/>
                <input type="text" name="api_secret" placeholder={'Hello World!'}/><br/>
                <input type="text" name="api_order_id" placeholder={'Hello World!'}/><br/>
            </div>
            {
                error && <div>{error}</div>
            }
            <div className="mb-3"/>
            <button onClick={async () => {
                if (props?.order_id && props?.vendor_amount && props?.vendor_currency) {

                    // on server
                    const postData = {
                        order_id: props.order_id,
                        vendor_amount: props.vendor_amount,
                        vendor_currency: props.vendor_currency,
                    }
                    try {
                        const res =await axios.post('/api/order/payment', postData)
                        console.log(res.data);
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    setError('Missing parameters')
                }

                // redirect to payment success page
                if (props?.return_url) {
                    window.location.href = props.return_url;
                } else {
                    window.location.href = '/';
                }

            }}>Pay Now</button>

            <button onClick={() => {
                if (props?.cancel_url) {
                    window.location.href = props.cancel_url;
                }
            }}>Cancel</button>

            <button onClick={() => {
                if (props?.cancel_url) {
                    window.location.href = props.cancel_url;
                }
            }}>Payment Failed</button>
        </div>
    );
};


export const getServerSideProps = async (ctx: NextPageContext) => {
    // @ts-ignore
    const bodyUrlEncoded = ctx.req._readableState.buffer?.tail?.data?.toString();
    if (bodyUrlEncoded) {
        const body = new URLSearchParams(bodyUrlEncoded);
        const data = Object.fromEntries(body);

        return {
            props: data,
        };
    }
    return {
        props: {},
    }
};

export default Test_payment;
