import type {NextPage} from 'next';
import {Header} from '../comps/header/header';
import {Cats} from '../comps/cats/cats';
import {HomeSlider} from '../comps/slider/hero-slider';
import {useEffect} from 'react';
import frontState, {getCategoryById, initFrontState} from '../states/front';
import {getImageUrl} from '../lib/config';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {Background} from '../comps/background';
import {Container} from '../comps/container';
import InfiniteScroll from 'react-infinite-scroller';
import {searchActions, searchState} from '../states/search';
import {ProductCard} from '../comps/pcard/product-card';
import {useSnapshot} from 'valtio';
import {useHasHydrated} from '../lib/utils';
import pageState from '../states/page';
import {Loader} from '../comps/loader';
import profileState, {profileActions} from '../states/profile';
import {CartSummery} from '../comps/cartsum/cart-summery';
import {getDod, getFrontDocs, getSliders, TFrontDocs} from '../lib/fetcher';
import {prisma} from '../prisma';
import {LogoSlider} from '../comps/logo-slider/logo-slider';


type Props = {
    frontDocs: TFrontDocs
}
let ssrinit = false;
const Home: NextPage<Props> = (props) => {

    if (!ssrinit) {
        initFrontState(props.frontDocs);
        ssrinit = true;
    }

    const {products, totalPage, currentPage, relatedProducts, hasMore} = useSnapshot(searchState);
    const hasHydrated = useHasHydrated();
    const {searchContainerMargin, mainBannerLoaded, noDodLoaded, categories} = useSnapshot(frontState);

    useEffect(() => {

        if (profileState.id) {
            profileActions.refresh();
        }

        pageState.isCheckoutPage = true;

        getSliders().then((sliders) => {
            frontState.sliderImageUrls = sliders.map((slider) => getImageUrl(slider.imageId));
        });


        getDod().then((dods) => {
            frontState.dods = dods.map((dod) => {
                return {
                    imageUrl: getImageUrl(dod.imageId),
                    id: dod.productId,
                };
            });
        });

        // // initialize category
        // frontState.categories = props?.categories || [];
        // // initialize slider
        // frontState.sliderImageUrls = props?.sliderImageUrls || [];
        // // initialize dod
        // frontState.dods = props?.dods || [];


        // searchActions.search(getQuery());
        searchActions.search({
            categorized: frontState.categories,
        });

        return () => {
            searchActions.clear();
            pageState.isCheckoutPage = false;
        };
    }, []);

    return (
        <>
            <Header/>

            <Container className="container home-container">
                <Cats/>
                <h1 className={'text-center fw-bold mt-3 mb-0'}>Welcome to Promo Solutions (Pvt) Ltd!</h1>
                <p className={'text-center opacity-75'}>(all printing solutions under one company)</p>
                <HomeSlider/>
                {/*<Dod/>*/}
                <div className={'mt-5'}
                     style={{
                         marginLeft: hasHydrated ? searchContainerMargin : 0,
                         marginRight: hasHydrated ? searchContainerMargin : 0,
                     }}
                >

                    {
                        (mainBannerLoaded || noDodLoaded > 3) && (
                            <>
                                <CartSummery/>
                                <LogoSlider/>

                                {/*<h2 className={'text-center'}>Products</h2>*/}
                                <InfiniteScroll
                                    pageStart={0}
                                    loadMore={() => {
                                        searchActions.extend();
                                    }}
                                    hasMore={hasMore}
                                    loader={<Loader key={0} color={'#B60C0C'}/>}
                                >
                                    {
                                        products.map((product, index) => (
                                            <>
                                                {
                                                    product.isFirst ?
                                                        <h2 className={'text-center mt-4'}>
                                                            {getCategoryById(product.categoryId)?.name}
                                                        </h2> : null
                                                }
                                                <ProductCard key={product.id} product={product}/>
                                            </>
                                        ))
                                    }
                                </InfiniteScroll>
                            </>
                        )
                    }
                    <div className={'mb-5'}/>
                </div>

                <Background align={'left'} bg={'/static/newbg/left-bg4.png'}/>
                <Background align={'right'} bg={'/static/newbg/right-bg4.png'}/>
                {/*<Background align={'right'} bg={'/static/images/home-bg/right-bg3.png'}/>*/}
            </Container>
        </>
    );
};

export default Home;

export async function getStaticProps() {
    const documents = await prisma.document.findMany();
    let r = {
        docs: documents?.map(doc => ({
            key: doc.key,
            value: JSON.parse(doc.value).value,
        })) || [],
        cats: await prisma.category.findMany(),
    };
    const dd = await getFrontDocs(r);

    return {
        props: {
            frontDocs: dd,
        },
        // 3 days
        revalidate: 60 * 60 * 24 * 3,
    };
}
