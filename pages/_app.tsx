import "../styles/global/fonts.scss";
import 'normalize.css/normalize.css';
import '../styles/bootstrap/bootstrap.scss';
import '../styles/global/globals.scss';
import '/comps/header/header.scss';
import '/comps/cats/cats.scss';
import '../comps/slider/slider.scss';
import '../comps/dod/dod.scss';
import '../comps/cartsum/cart-summery.scss';
import '../comps/pcard/product-card.scss';
import '../comps/cartitem/cart-item.scss';
import '../comps/checksum/checksum.scss';
import '../comps/footer/footer.scss';
import type {AppProps} from 'next/app';
import {Sidebar} from '../comps/sidebar';
import '@fortawesome/fontawesome-free/css/fontawesome.min.css';
import '@fortawesome/fontawesome-free/css/brands.min.css';
import '@fortawesome/fontawesome-free/css/solid.min.css';
import 'reactjs-popup/dist/index.css';
import {useEffect} from 'react';
import {useRouter} from 'next/router';
import frontState from '../states/front';
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

import 'react-image-lightbox/style.css';

function MyApp({Component, pageProps}: AppProps) {
    // return <Component {...pageProps} />
    const router = useRouter();
    useEffect(() => {
        frontState.isSidebarActive = false;
    }, [router.asPath]);
    return (
        <>
            <Component {...pageProps} />
            <Sidebar/>
        </>
    );
}

export default MyApp;
