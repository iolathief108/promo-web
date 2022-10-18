import {useSnapshot} from 'valtio';
import {cartCalc} from '../../states/cart';
import {getDeliveryFee, useHasHydrated} from '../../lib/utils';
import {useEffect, useState} from 'react';
import Link from 'next/link';


export function CheckoutSummery() {

    const {orderTotal} = useSnapshot(cartCalc);
    const hasHydrated = useHasHydrated();
    const [, setShippingCharge] = useState(0);

    useEffect(() => {
        getDeliveryFee().then(setShippingCharge);

    }, []);

    return (
        <div className={'checksum'}>
            <div className={'title-container'}>
                <span>Checkout Summary</span>
            </div>
            <div className={'content-wrap row'}>
                <div className={'col-md-5'}>
                    <div className={'white-bg'}>
                        <span>Total Amount to Pay </span>
                    </div>
                </div>
                <div className={'col-4'}>
                    <div className={'white-bg'}>
                        <span>SGD {hasHydrated ? orderTotal : 0}</span>
                    </div>
                </div>
                <div className={'col-3'}>
                    <a>
                            <span className={'chb'}>
                                Pay Now
                            </span>
                    </a>
                </div>
            </div>
        </div>
    );
}
