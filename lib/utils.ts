import {useEffect, useLayoutEffect, useState} from 'react';
import pageState from '../states/page';
import {Fetcher} from './fetcher';
import {parsePhoneNumber} from 'libphonenumber-js';
import {isStaging, mobilePrefix} from './config';


export function getQuery(param?: {cat?: string, key?: string, pin?: string}) {

    if (param?.key) {
        // url decode
        param.key = decodeURIComponent(param.key);
    }

    // const state = searchState;
    const cat = param && param.cat ? param.cat : undefined;
    const key = param && param.key ? param.key : undefined;
    const pin = param && param.pin && Number.isInteger(Number(param.pin)) ? Number(param.pin) : undefined;

    if (cat && key && pin) {
        return {
            keywords: key,
            categorySlug: cat,
            pinId: pin,
        };
    }
    if (key && pin) {
        return {
            keywords: key,
            pinId: pin,
        };
    }
    if (cat && key) {
        return {
            keywords: key,
            categorySlug: cat,
        };
    }
    if (pin) {
        return {
            pinId: pin,
        };
    }
    if (cat) {
        return {
            categorySlug: cat,
        };
    }
    if (key) {
        return {
            keywords: key,
        };
    }
    return {};
}

export function getUrl(param?: {categorySlug?: string | string[], keywords?: string | string[]}) {
    // const snap = searchState;
    // const categorySlug = param?.categorySlug || snap.search?.categorySlug;
    // const keywords = param?.keywords || snap.search?.keywords;

    if (param && param.keywords && Array.isArray(param.keywords)) {
        param.keywords = param.keywords.join(' ');
    }
    if (param && param.categorySlug && Array.isArray(param.categorySlug)) {
        param.categorySlug = param.categorySlug[0];
    }

    const categorySlug = param?.categorySlug;
    const keywords = param?.keywords;
    // console.log('url', categorySlug, keywords);

    if (categorySlug && keywords) {
        return `/search/${categorySlug}/${keywords}`;
    }
    if (keywords) {
        return `/search/${keywords}`;
    }
    if (categorySlug) {
        return `/${categorySlug}`;
    }

    return '/search';
}

export function useHasHydrated(beforePaint = true) {
    const [hasHydrated, setHasHydrated] = useState(false);

    const isServer = typeof window === 'undefined';
    const useEffectFn = beforePaint && !isServer ? useLayoutEffect : useEffect;

    useEffectFn(() => {
        setHasHydrated(true);
    }, []);

    return hasHydrated;
}

export const getDeliveryFee = async () => {
    try {
        const res = await Fetcher.post<{shippingCharge: number}>('/order/shipping-charge', {});
        // if shipping charge is number then return it
        if (res.data?.shippingCharge && typeof res.data.shippingCharge === 'number') {
            return res.data.shippingCharge;
        } else {
            return 0;
        }
    } catch (e) {
        // console.log(e);
        return 0;
    }
};

// number to string wit commas and decimal
export function numberToMoney(num: number) {

    // if num has decimal
    if (num % 1 !== 0) {
        num = Math.round(num * 100) / 100;

        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // if num has no decimal
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.00';
}

export function getContainerWidth() {

    if (window.innerWidth > 1400) {
        return 1320;
    }
    if (window.innerWidth > 1200) {
        return 1140;
    }
    if (window.innerWidth > 992) {
        return 960;
    }
    if (window.innerWidth > 768) {
        return 720;
    }
    if (window.innerWidth > 576) {
        return 540;
    }

    return window.innerWidth;
}

export function getWindowWidth() {
    return window.innerWidth;
}

function getCheckoutContainerMargin() {
    if (window.innerWidth > 1400) {
        return 240;
    }
    if (window.innerWidth > 1200) {
        return 200;
    }
    if (window.innerWidth > 992) {
        return 160;
    }
    if (window.innerWidth > 768) {
        return 0;
    }
    if (window.innerWidth > 576) {
        return 0;
    }

    return 0;
}

export function getSearchContainerMargin() {

    if (typeof pageState !== 'undefined' && pageState?.isCheckoutPage) {
        return getCheckoutContainerMargin();
    }

    if (window.innerWidth > 1400) {
        return 330;
    }
    if (window.innerWidth > 1200) {
        return 270;
    }
    if (window.innerWidth > 992) {
        return 180;
    }
    if (window.innerWidth > 768) {
        return 0;
    }
    if (window.innerWidth > 576) {
        return 0;
    }

    return 0;
}

export function getSearchContainerWidth() {

}

export function getSearchContentSideSpace() {
    const containerSpace = (getWindowWidth() - getContainerWidth()) / 2;
    const margin = getSearchContainerMargin();
    return containerSpace + margin;
}

export function formatPhoneNumber(phoneNumberString: string) {
    try {
        const phoneNumber = parsePhoneNumber(phoneNumberString);
        let phone = phoneNumber.formatInternational();
        if (phone) {
            return phone;
        } else {
            return phoneNumberString;
        }
    } catch (e) {
        return phoneNumberString;
    }
}

export const getStdPhone = (phone) => {

    // replace any - with ''
    phone = phone.replace(/-/g, '');
    // replace any space with ''
    phone = phone.replace(/ /g, '');

    if (isStaging) {
        return phone;
    }

    if (phone?.startsWith('+')) {
        if (!phone.startsWith(mobilePrefix)) {
            return false;
        }
    } else {
        phone = mobilePrefix + phone;
    }


    return phone;
};
