import {cartActions, CartItem} from '../../states/cart';
import {getImageUrl} from '../../lib/config';
import {numberToMoney} from '../../lib/utils';


function Quantity({quantity, setQuantity, disable}: any) {

    return (
        <span className={'qtyva' + (
            disable ? ' disabled' : ''
        )}>
            <button onClick={() => {
                if (disable) return;
                if (quantity > 0) {
                    setQuantity(quantity - 1);
                }
            }}>-</button>
            <div className={'value'}>
                <span>{quantity}</span>
            </div>
            <button onClick={() => {
                if (disable) return;
                if (quantity > 30) {
                    return;
                }
                setQuantity(quantity + 1);
            }}>+</button>
        </span>
    );
}

function VarInfo({
                     price,
                     name,
                     qty,
                     setQty,
                     isInStock,
                 }: {price: number, name: string, qty: number, setQty: any, isInStock: boolean}) {
    return (
        <>
            <div className={'total'}><span>SGD {numberToMoney(price)}</span></div>
            <div className={'var-name'}>{name}</div>
            <Quantity quantity={qty} setQuantity={setQty} disable={!isInStock}/>
        </>
    );
}


interface Props {
    cartItem: CartItem;
}

export function CartItem({cartItem}: Props) {

    const onRemove = () => {
        cartActions.remove(cartItem.product.id);
    };

    const getV1Total = () => cartItem.product.variant1Price * cartItem.v1Qty;

    const getV2Total = () => cartItem.product.variant2Price * cartItem.v2Qty;

    return (
        // <div className={'citem-outer'}>
        <div className={'pcard-outer'}>
            <div className={'inner row'}>
                <div className={'image order-1 col-6 col-sm-3 pe-0'}>

                    <div className={'image-container position-relative'}>
                        <img src={getImageUrl(cartItem.product.imageId)} alt={cartItem.product.name}/>
                        <h2 className={'name'}>{cartItem.product.name}</h2>
                    </div>
                </div>

                <div className={'var var1 order-3 order-sm-2 col-6 col-sm-3 mt-4 mt-sm-0 pe-0'}>
                    <VarInfo price={cartItem.product.variant1Price} name={cartItem.product.variant1Name}
                             qty={cartItem.v1Qty}
                             setQty={(qty: number) => cartActions.setV1Qty(cartItem.product, qty)}
                             isInStock={cartItem.product.variant1InStock}/>
                </div>

                <div className={'var var2 order-4 order-sm-3 col-6 col-sm-3 mt-4 mt-sm-0 ps-0'}>
                    <VarInfo price={cartItem.product.variant2Price} name={cartItem.product.variant2Name}
                             qty={cartItem.v2Qty}
                             setQty={(qty: number) => cartActions.setV2Qty(cartItem.product, qty)}
                             isInStock={cartItem.product.variant2InStock}/>
                </div>

                {/*<div className={'total col-md-3'}>*/}
                <div className={'total atc  order-2 order-sm-4 col-6 col-sm-3'}>
                    <div className={'item-total'}><span>SGD {numberToMoney(getV1Total() + getV2Total())}</span></div>
                    <button className={'atc-btn remove-btn'} onClick={onRemove}>Remove</button>
                </div>
            </div>
        </div>
    );
}
