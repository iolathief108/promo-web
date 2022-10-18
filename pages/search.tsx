import type {NextPage, NextPageContext} from 'next';
import {Header} from '../comps/header/header';
import {Cats} from '../comps/cats/cats';
import {useEffect} from 'react';
import {searchActions, searchState} from '../states/search';
import {useSnapshot} from 'valtio';
import {Category} from '@prisma/client';
import {prisma} from '../prisma';
import frontState from '../states/front';
import {useRouter} from 'next/router';
import {getQuery, useHasHydrated} from '../lib/utils';
import {ProductCard} from '../comps/pcard/product-card';
import {CartSummery} from '../comps/cartsum/cart-summery';
import {Background} from '../comps/background';
import {Banner} from '../comps/banner';
import InfiniteScroll from 'react-infinite-scroller';
import {Container} from '../comps/container';
import {Loader} from '../comps/loader';
import Head from 'next/head';


type Props = {
    categories: Category[];
}
const Search: NextPage<Props> = () => {

    const {products, totalPage, currentPage, relatedProducts, pageLoading} = useSnapshot(searchState);
    const {searchContainerMargin, mainBannerLoaded, noDodLoaded} = useSnapshot(frontState);
    const {bannerA, bannerB, bannerC} = useSnapshot(frontState);
    const router = useRouter();
    const {cat, key} = router.query as {cat: string, key: string};
    const hasHydrated = useHasHydrated();

    useEffect(() => {
        // initialize search
        searchActions.search(getQuery(router.query));
    }, [cat, key]);

    useEffect(() => {
        // initialize category
        // frontState.categories = props?.categories || [];

        return () => {
            searchActions.clear();
        };
    }, []);

    const getSearchTitle = () => {
        if (cat && key) {
            // convert cat to titlecase
            let title = cat.charAt(0).toUpperCase() + cat.slice(1);
            // remove - from cat
            title = title.replace(/-/g, ' ');

            return `${title} - ${key}`;
        }
        if (cat) {
            // convert cat to titlecase
            return cat.charAt(0).toUpperCase() + cat.slice(1);
        }
        if (key) {
            return key;
        }
        return 'Search';
    };

    return (
        <>
            <Header/>
            <Head>
                <title>
                    {getSearchTitle()} - NeatKitch
                </title>
            </Head>
            <Container className="container search pb-4">
                <Cats/>
                <div style={{
                    marginLeft: hasHydrated ? searchContainerMargin : 0,
                    marginRight: hasHydrated ? searchContainerMargin : 0,
                }}>
                    <CartSummery/>
                    <div className={'mt-4'}>
                        {
                            !pageLoading && <InfiniteScroll
                                pageStart={0}
                                loadMore={() => {
                                    searchActions.extend();
                                }}

                                hasMore={currentPage < totalPage}
                                loader={<Loader key={0} color={'#B60C0C'}/>}
                            >
                                {
                                    products.map((product, index) => (
                                        <ProductCard key={product.id} product={product}/>
                                    ))
                                }
                            </InfiniteScroll>
                        }
                        {
                            products.length === 0 && !pageLoading &&
                            <div className={'text-center'}>
                                <img style={{
                                    width: '100%',
                                    maxWidth: '200px',
                                }} src={'/static/cart/no-products.png'} className={'empty'}/>
                                <h2>No Products Found</h2>
                                <p style={{
                                    maxWidth: '500px',
                                    margin: 'auto',
                                }}>
                                    Your search did not match any products. Please try again with different keywords.
                                </p>
                            </div>
                        }
                        {
                            pageLoading && <Loader color={'#B60C0C'}/>
                        }
                        {
                            relatedProducts && relatedProducts.length > 0 && (
                                <>
                                    <h3 className="text-center mt-4 pt-2">Related Products</h3>
                                    {
                                        relatedProducts.map((product) => (
                                            <ProductCard key={product.id} product={product}/>
                                        ))
                                    }
                                </>
                            )
                        }
                    </div>
                </div>
                <Background withMargin align={'right'} bg={'/static/images/right-bg2.jpg'}/>
                <Banner align={'left'} bannerLarge={bannerA}/>
                <Banner align={'right'}
                        bannerTop={bannerB}
                        bannerBottom={bannerC}/>
            </Container>
        </>
    );
};

export default Search;

// export const getServerSideProps = async () => {
//
//     const categories: Category[] = await prisma.category.findMany();
//
//     return {
//         props: {
//             categories,
//         },
//     };
// };
