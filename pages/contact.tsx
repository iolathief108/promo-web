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
                    <p>We at NeatKitch have the best quality vegetables, fruits and other kitchen items. If you have any
                        questions or queries, please do not hesitate to contact us. We will be happy to help you.
                    </p>

                    <h3>General questions or concerning orders</h3>
                    <p>If you need to get in touch with us for general questions or concerning orders, please email us
                        at:</p>

                    {/*    email*/}
                    <p>
                        <a href="mailto:info@neatkitch.com">
                            info@neatkitch.com
                        </a>
                    </p>
                    {/*<p>Or call us at:</p>*/}

                    {/*<p><a href="tel:+44 (0)20 7891 9999">+44 (0)20 7891 9999</a></p>*/}
                    <p>We will get back to you as soon as possible. Thank you for your interest in NeatKitch!</p>
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
