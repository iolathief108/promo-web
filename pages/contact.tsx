import type {NextPage} from 'next';
import {Header} from '../comps/header/header';
import {Cats} from '../comps/cats/cats';
import {Container} from '../comps/container';
import {Background} from '../comps/background';
import {Banner} from '../comps/banner';
import {useSnapshot} from 'valtio';
import frontState from '../states/front';
import {useHasHydrated} from '../lib/utils';
import Head from 'next/head';
import React from 'react';


const Contact: NextPage = () => {
    const {bannerA, bannerB, bannerC} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();
    const {searchContainerMargin, windowWidth} = useSnapshot(frontState);

    return (
        <>
            <Header/>
            <Head>
                <title>
                    Contact Us - NeatKitch
                </title>
            </Head>
            <Container className="container search">
                <Cats/>
                <div className={'mt-5 text-left'} style={{
                    marginLeft: hasHydrated ? searchContainerMargin : 0,
                    marginRight: hasHydrated ? searchContainerMargin : 0,
                }}>
                    <h1>Get in touch with us!</h1>
                    <p>Welcome to Promo Solutions (Pvt) Ltd.! We are your one-stop shop for all your printing needs.
                        From custom printed paper bags to shopping bags and non-woven bags, we have it all! We also sell
                        printing equipment so you can get the perfect print every time!
                    </p>

                    <h3>General questions or concerning orders</h3>
                    <p>If you need to get in touch with us for general questions or concerning orders, please email us
                        at:</p>
                    <p>
                        <a href="mailto:info@promosolutions.lk">
                            info@promosolutions.lk
                        </a>
                    </p>
                    <p>Or call us at:</p>

                    <p>
                        <a href="tel:+94778580000">(+94) 11 347 4700</a><br/>
                        <a href="tel:+94778580000">(+94) 77 858 0000</a>
                    </p>
                    <p>We will get back to you as soon as possible. Thank you for your interest in Promo Solutions (Pvt) Ltd!</p>

                    <h3>Address</h3>
                    <p>
                        <b>Promo Solutions (Pvt) Ltd,</b><br/>
                        St. Andrews Place, <br/>
                        Colombo-15,<br/>
                        Sri Lanka.
                    </p>
                </div>
            </Container>
            <Background withMargin align={'right'} bg={'/static/images/right-bg.jpg'}/>

            {
                windowWidth > 1200 &&
                <>
                    <Banner align={'left'} bannerLarge={bannerA}/>
                    <Banner align={'right'}
                            bannerTop={bannerB}
                            bannerBottom={bannerC}/>
                </>
            }
        </>
    );
};

export default Contact;
