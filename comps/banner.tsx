import {useSnapshot} from 'valtio';
import frontState from '../states/front';
import {useHasHydrated} from '../lib/utils';
import {useEffect, useRef, useState} from 'react';


type Prop = {
    align?: 'left' | 'right';
    bannerLarge?: string
    bannerTop?: string
    bannerBottom?: string
}

const imageHeights: {
    [key: string]: number;
} = {};

let bannerLargeHeightBefore = 0;
let bannerTopHeightBefore = 0;
let bannerBottomHeightBefore = 0;

export function Banner(props: Prop) {

    const {bannerMargin, bannerWidth, isBannerVisible, windowHeight, headerHeight} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();

    const bannerLargeRef = useRef<HTMLImageElement>(null);
    const bannerTopRef = useRef<HTMLImageElement>(null);
    const bannerBottomRef = useRef<HTMLImageElement>(null);
    const [bannerLargeHeight, setBannerLargeHeight] = useState(0);
    const [bannerTopHeight, setBannerTopHeight] = useState(0);
    const [bannerBottomHeight, setBannerBottomHeight] = useState(0);

    useEffect(() => {


        if (!hasHydrated) {
            return;
        }
        if (props.bannerLarge && imageHeights[props?.bannerLarge]) {
            setBannerLargeHeight(imageHeights[props.bannerLarge]);
            return;
        }
        // bannerTop and bannerBottom
        if (props.bannerTop && imageHeights[props.bannerTop] && props.bannerBottom && imageHeights[props.bannerBottom]) {
            setBannerTopHeight(imageHeights[props.bannerTop]);
            setBannerBottomHeight(imageHeights[props.bannerBottom]);
            return;
        }
        // if (props.bannerTop && imageHeights[props?.bannerTop]) {
        //     setBannerTopHeight(imageHeights[props.bannerTop]);
        //     return;
        // }
        // if (props.bannerBottom && imageHeights[props?.bannerBottom]) {
        //     setBannerBottomHeight(imageHeights[props.bannerBottom]);
        //     return;
        // }


        setTimeout(() => {
            if (bannerLargeRef.current) {
                setBannerLargeHeight(bannerLargeRef.current.offsetHeight);
            }
            if (bannerTopRef.current) {
                setBannerTopHeight(bannerTopRef.current.offsetHeight);
            }
            if (bannerBottomRef.current) {
                setBannerBottomHeight(bannerBottomRef.current.offsetHeight);
            }
        }, 3);

        const bannerLarge = setInterval(() => {
            if (bannerLargeRef.current) {
                setBannerLargeHeight(bannerLargeRef?.current.height);

                if (bannerLargeRef.current.height > 0) {
                    clearInterval(bannerLarge);
                    if (props.bannerLarge) {
                        imageHeights[props.bannerLarge] = bannerLargeRef.current.height;
                    }
                }
            }

        }, 10);

        const bannerTop = setInterval(() => {
            if (bannerTopRef.current) {
                setBannerTopHeight(bannerTopRef?.current.height);

                if (bannerTopRef.current.height > 0) {
                    clearInterval(bannerTop);
                    if (props.bannerTop) {
                        imageHeights[props.bannerTop] = bannerTopRef.current.height;
                    }
                }
            }
        }, 10);

        const bannerBottom = setInterval(() => {
            if (bannerBottomRef.current) {
                setBannerBottomHeight(bannerBottomRef?.current.height);

                if (bannerBottomRef.current.height > 0) {
                    clearInterval(bannerBottom);
                    if (props.bannerBottom) {
                        imageHeights[props.bannerBottom] = bannerBottomRef.current.height;
                    }
                }
            }
        }, 10);

    }, [hasHydrated]);

    useEffect(() => {

        if (bannerLargeHeight > 0) {
            bannerLargeHeightBefore = bannerLargeHeight;
        }
        if (bannerTopHeight > 0) {
            bannerTopHeightBefore = bannerTopHeight;
        }
        if (bannerBottomHeight > 0) {
            bannerBottomHeightBefore = bannerBottomHeight;
        }
    }, [bannerLargeHeight, bannerTopHeight, bannerBottomHeight]);

    if (!hasHydrated || !isBannerVisible) {
        return null;
    }

    const getHeight = () => {

        // debugger
        if (props.bannerTop) {
            return bannerTopHeight + bannerBottomHeight + 40;
        }

        const or = bannerLargeHeight + bannerTopHeight + bannerBottomHeight;
        if (or) {
            return or;
        }
        let h = 0;
        if (props.bannerLarge) {
            h += bannerLargeHeightBefore;
        }
        if (props.bannerTop) {
            h += bannerTopHeightBefore;
        }
        if (props.bannerBottom) {
            h += bannerBottomHeightBefore;
        }
        // debugger
        return h;
    };

    const getScreenHeight = () => windowHeight - headerHeight;


    return (
        <div
            style={{
                position: 'fixed',
                top: getHeight() ? headerHeight + (getScreenHeight() - getHeight()) / 2 : 0,
                left: props.align === 'left' ? bannerMargin : undefined,
                right: props.align === 'right' ? bannerMargin * 0.85 : undefined,
                backgroundPosition: props.align === 'right' ? 'left' : 'right',
                width: bannerWidth ? props.bannerLarge ? `${bannerWidth}px` : `${bannerWidth * 1.18}px` : 150,
                height: 'auto',
                zIndex: -1,
            }}
        >
            {
                props.bannerLarge && (
                    <img ref={bannerLargeRef} src={props.bannerLarge} style={{
                        objectFit: 'cover',
                        width: '100%',
                        opacity: bannerLargeHeight ? 1 : bannerLargeHeightBefore ? 1 : 0,
                    }}/>
                )
            }
            {
                props.bannerTop && (
                    <img ref={bannerTopRef} src={props.bannerTop} style={{
                        objectFit: 'cover',
                        width: '100%',
                        opacity: bannerTopHeight ? 1 : bannerTopHeightBefore ? 1 : 0,
                        marginBottom: 40,
                        borderRadius: 3
                    }}/>
                )
            }
            {
                props.bannerBottom && (
                    <img ref={bannerBottomRef} src={props.bannerBottom} style={{
                        objectFit: 'cover',
                        width: '100%',
                        opacity: bannerBottomHeight ? 1 : bannerBottomHeightBefore ? 1 : 0,
                        borderRadius: 3
                    }}/>
                )
            }
        </div>
    );
}
