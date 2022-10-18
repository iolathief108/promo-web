import {cartActions, cartCalc} from '../../states/cart';
import {useSnapshot} from 'valtio';
import {useHasHydrated} from '../../lib/utils';
import Link from 'next/link';
import SearchBox from '../header/search-box';


interface Props {
    isPaynow: boolean;
    onPay: (e?: any) => any;
    isDisable?: boolean;
}

export function CartSummery(props: Props | {}) {

    const {orderTotal} = useSnapshot(cartCalc);
    const hasHydrated = useHasHydrated();

    return (
        <div className={'cart-summery mt-4'}>
            {/*<div className={'title-container'}>*/}
            {/*    <span>Cart Summary</span>*/}
            {/*</div>*/}
            {/*<div className={'content-wrap row'}>*/}
            {/*    <div className={'col-md-5 mb-3 mb-md-0'}>*/}
            {/*        <div className={'white-bg fw-semibold'}>*/}
            {/*            <span>Total Amount to Pay </span>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*    <div className={'col-6 col-md-4'}>*/}
            {/*        <div className={'white-bg fw-semibold'}>*/}
            {/*            <span>SGD {hasHydrated ? orderTotal : 0}</span>*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*    <div className={'col-6 col-md-3'}>*/}
            {/*        {*/}
            {/*            // props.*/}
            {/*            'isPaynow' in props && props?.isPaynow && hasHydrated ?*/}
            {/*                (*/}
            {/*                    <a className={*/}
            {/*                        (props?.isDisable ? ' disabled' : '')*/}
            {/*                    } onClick={(e) => {*/}
            {/*                        if (props?.isDisable) {*/}
            {/*                            return;*/}
            {/*                        }*/}
            {/*                        e.preventDefault();*/}
            {/*                        props.onPay();*/}
            {/*                    }}>*/}
            {/*                        <span className={'chb'}>*/}
            {/*                            Pay Now*/}
            {/*                        </span>*/}
            {/*                    </a>*/}
            {/*                ) : (*/}
            {/*                    <Link href="/checkout">*/}
            {/*                        <a>*/}
            {/*                            <span className={'chb'}>*/}
            {/*                                Checkout*/}
            {/*                            </span>*/}
            {/*                        </a>*/}
            {/*                    </Link>*/}
            {/*                )*/}
            {/*        }*/}
            {/*    </div>*/}
            {/*    /!*<button style={{marginLeft: 30}} onClick={onClear}>Clear</button>*!/*/}
            {/*</div>*/}

            <div className={'search-container'}>
                <SearchBox placeholder={'Search...'}/>
            </div>
        </div>
    );
}
