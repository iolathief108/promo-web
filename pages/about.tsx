import type {NextPage} from 'next';
import {Header} from '../comps/header/header';
import {Cats} from '../comps/cats/cats';
import {Container} from '../comps/container';
import {useSnapshot} from 'valtio';
import frontState from '../states/front';
import {useHasHydrated} from '../lib/utils';
import {Background} from '../comps/background';
import {Banner} from '../comps/banner';
import Head from 'next/head';
import {useEffect} from 'react';


const About: NextPage = () => {
    const {bannerA, bannerB, bannerC} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();
    const {searchContainerMargin, windowWidth} = useSnapshot(frontState);

    useEffect(() => {

    }, []);

    return (
        <>
            <Header/>

            <Head>
                <title>
                    About Us - NeatKitch
                </title>
            </Head>
            <Container className="container search">
                <Cats/>
                <div className={'mt-5 text-left'} style={{
                    marginLeft: hasHydrated ? searchContainerMargin : 0,
                    marginRight: hasHydrated ? searchContainerMargin : 0,
                }}>
                    <h1>About Us</h1>
                    <p>
                        Promo Solutions (Pvt) Ltd was established in year 2022 as a trading company, which is expanded into manufacturing packaging materials.
                    </p>
                    <p>
                        Thank you for your interest in Promo Solutions!
                    </p>
                    <h2>Environment Policy</h2>
                    <p>
                        We are committed to the protection of the environment and the health and safety of our employees, customers, and the public. We will comply with all applicable environmental laws and regulations and will strive to exceed them where possible.
                    </p>
                    <p>
                        We will continually improve our environmental performance by setting and reviewing environmental objectives and targets, and by implementing and maintaining an effective environmental management system.
                    </p>
                    <p>
                        <strong>Our environmental objectives are:</strong>
                        <ul>
                            <li>Comply with all applicable environmental laws and regulations.</li>
                            <li>Reduce the environmental impact of our operations.</li>
                            <li>Reduce the environmental impact of our products.</li>
                            <li>Reduce the environmental impact of our packaging.</li>
                            <li>Reduce the environmental impact of our distribution.</li>
                        </ul>
                    </p>

                    <h2>Quality Policy</h2>
                    <p>
                        We at Promo Solutions are committed to provide our customers with quality products and services that meet their requirements and expectations. We will achieve this by:
                    </p>
                    <ul>
                        <li>01. Non Woven Related Products</li>
                        <li>02. polythene Related products</li>
                        <li>03. kraft paper Related products</li>
                        <li>04. offset printing products</li>
                        <li>05. promotional printing products</li>
                        <li>06. advertising products</li>
                        <li>07. machineries delivery</li>
                        <li>08. logistics</li>
                        <li>09. providing industries</li>
                        <li>10. online marketing</li>
                    </ul>
                    <p>
                    that will consistently meet  customer expectations for quality, service. delivery and satisfy the requirements of other stake holders as per the strategic direction of the organization.
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

export default About;
