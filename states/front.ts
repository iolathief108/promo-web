import {proxy, subscribe} from 'valtio';
import {Category} from '@prisma/client';
import {getContainerWidth, getSearchContainerMargin, getSearchContentSideSpace, getWindowWidth} from '../lib/utils';
import pageState from './page';
import {getBanners, TFrontDocs} from '../lib/fetcher';
import {getImageUrl} from '../lib/config';


interface Interface {
    categories: Category[];
    sliderImageUrls: string[];
    dods: {
        imageUrl: string;
        id?: number;
    }[];

    logoUrls: string[];

    windowHeight: number;
    windowWidth: number;

    isBgVisible: boolean;
    bgWidth: number;
    searchContainerMargin: number;

    isBannerVisible: boolean;
    bannerMargin: number;
    bannerWidth: number;

    isSidebarActive: boolean;

    headerHeight: number;

    mainBannerLoaded: boolean;
    noDodLoaded: number;

    // banners
    bannerA?: string;
    bannerB?: string;
    bannerC?: string;
}

const frontState = proxy<Interface>({
    categories: [],
    sliderImageUrls: [],
    dods: [],

    logoUrls: [],

    isBgVisible: false,
    bgWidth: 0,

    searchContainerMargin: 0,

    isBannerVisible: false,
    bannerMargin: 0,
    bannerWidth: 0,
    windowHeight: 0,
    windowWidth: 0,

    isSidebarActive: false,

    mainBannerLoaded: false,
    noDodLoaded: 0,

    headerHeight: 0,
});

export function initFrontState(fdata: TFrontDocs) {
    frontState.categories = fdata?.cats || [];
    // frontState.
    frontState.sliderImageUrls = fdata.sliders?.map(s => getImageUrl(s.imageId)) || [];
    frontState.dods = fdata?.dods?.map(d => ({
        imageUrl: getImageUrl(d.imageId),
    })) || [];
}

export function getCategoryById(id: number) {
    return frontState.categories.find(c => c.id === id);
}

function initSize() {

    // if server
    if (typeof window === 'undefined') {
        return;
    }

    frontState.windowHeight = window.innerHeight;
    frontState.windowWidth = window.innerWidth;

    if (getWindowWidth() > 1200) {
        frontState.bgWidth = (getWindowWidth() - getContainerWidth()) / 2;
        frontState.isBgVisible = true;
    } else {
        frontState.bgWidth = getWindowWidth();
        frontState.isBgVisible = false;
    }
    // initialize banner
    if (getWindowWidth() > 992) {
        frontState.searchContainerMargin = getSearchContainerMargin();
        frontState.isBannerVisible = true;

        if (getSearchContentSideSpace() > 480) {
            frontState.bannerMargin = getSearchContentSideSpace() / 2 - 100;
            frontState.bannerWidth = 200;
        } else if (getSearchContentSideSpace() > 400) {
            frontState.bannerMargin = getSearchContentSideSpace() / 2 - 80;
            frontState.bannerWidth = 200;
        } else if (getSearchContentSideSpace() > 300) {
            frontState.bannerMargin = 50;
            frontState.bannerWidth = 200;
        } else {
            const bannerWidth = getSearchContentSideSpace() * 2 / 3;
            frontState.bannerMargin = (getSearchContentSideSpace() - bannerWidth) / 2 - 10;
            frontState.bannerWidth = bannerWidth;
        }
    } else {
        frontState.isBannerVisible = false;
        frontState.searchContainerMargin = 0;
    }
}

async function initBanner() {
    const banners = await getBanners();
    frontState.bannerA = banners?.bannerA;
    frontState.bannerB = banners?.bannerB;
    frontState.bannerC = banners?.bannerC;
}

(async () => {

    initBanner();

    // if server
    if (typeof window === 'undefined') {
        return;
    }

    // if current page is a sub page
    if (window.location.pathname.length > 1) {
        // init banners for not home pages
        frontState.mainBannerLoaded = true;
        frontState.noDodLoaded = 4;
    } else {
        // init in 5 seconds
        setTimeout(() => {
            if (!frontState.noDodLoaded) {
                frontState.mainBannerLoaded = true;
                frontState.noDodLoaded = 4;
            }
        }, 5000);
    }


    subscribe(pageState, () =>
        frontState.searchContainerMargin = getSearchContainerMargin(),
    );

    initSize();
    // on window resize
    window.addEventListener('resize', () => {
        initSize();
    });
})();

export default frontState;
