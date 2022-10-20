import {proxy} from 'valtio';
import {Category, Product} from '@prisma/client';
import {getProduct, getProducts} from '../lib/fetcher';
import {perPage} from '../lib/config';
// import {devtools} from 'valtio/utils';
import frontState from './front';


interface Interface {
    products: (Product & {
        // category?: Category
        isFirst?: boolean;
    })[]
    search: {
        keywords?: string,
        categorySlug?: string,
        pinId?: number,
    },
    pageLoading: boolean,
    totalPage: number,
    currentPage: number,
    relatedProducts?: Product[],

    // promo solutions home cat things
    categorized?: boolean,
    categoryOrder?: (Category & {
        done: boolean
    })[]
    hasMore?: boolean,
}

export const searchState = proxy<Interface>({
    products: [],
    search: {},
    totalPage: 0,
    pageLoading: false,
    currentPage: 0,
    categoryOrder: [],
    hasMore: true,
});

// devtools(searchState, {name: 'Search State', enabled: isDevelopment});

function getNowCategory() {
    return searchState?.categoryOrder?.find(c => !c.done);
}

/*** ACTIONS ***/
export const searchActions = {
    paginate: async (page?: number) => {
        searchState.currentPage = page ? page : 1;

        // fetch products
        const {products, totalPage, error} = await getProducts({
            search: searchState.search.keywords,
            categorySlug: searchState.search.categorySlug,
            take: perPage,
            page: searchState.currentPage,
        });

        if (!error) {
            searchState.products = products;
            searchState.totalPage = totalPage;
        } else {
            console.log(error);
        }
    },
    nextPage: () => {
        if (searchState.currentPage < searchState.totalPage) {
            // searchState.currentPage++;
            searchActions.paginate(searchState.currentPage + 1);
        }
    },
    prevPage: () => {
        if (searchState.currentPage > 1) {
            // searchState.currentPage--;
            searchActions.paginate(searchState.currentPage - 1);
        }
    },
    extend: async () => {

        if (!searchState.categorized) {
            if (searchState.currentPage > searchState.totalPage) {
                return;
            }
        }

        // fetch products
        console.log(searchState.currentPage);
        let {products, totalPage, error} = await getProducts({
            search: searchState.search.keywords,
            categorySlug: searchState.categorized ? getNowCategory()?.slug : searchState.search.categorySlug,
            take: perPage,
            page: searchState.currentPage + 1,
        });
        if (searchState.categorized) {
            if (products.length === 0) {
                let break1 = false;
                searchState.categoryOrder = searchState?.categoryOrder?.map((cat) => {
                    if (cat.done) {
                        return {
                            ...cat,
                        };
                    } else {
                        if (!break1) {
                            break1 = true;
                            return {
                                ...cat,
                                done: true,
                            };
                        } else {
                            return {
                                ...cat,
                            };
                        }
                    }
                });

                if (!getNowCategory()) {
                    searchState.hasMore = false;
                    return;
                }

                // fetch
                // pagination reset
                // set products
                // pagination up
                const {products: pro, totalPage: totalPage1} = await getProducts({
                    // search: searchState.search.keywords,
                    categorySlug: getNowCategory()?.slug,
                    take: perPage,
                    page: 1,
                });
                searchState.totalPage = totalPage1;
                searchState.currentPage = 0;

                pro[0].isFirst = true;

                products = pro;
                totalPage = totalPage1;
            }
        }

        if (!error) {
            // exclude pinned product from the result
            const pinId = searchState.search.pinId;
            if (pinId) {
                const pinIndex = products.findIndex(product => product.id === pinId);
                if (pinIndex > -1) {
                    products.splice(pinIndex, 1);
                }
            }

            searchState.products = [...searchState.products, ...products];
            // searchState.totalPage = totalPage;
            searchState.currentPage = searchState.currentPage + 1;
        } else {
            console.log(error);
            setTimeout(() => {
                searchActions.extend();
            });
        }
    },
    search: async ({
                       keywords,
                       categorySlug,
                       pinId,
                       categorized,
                   }: {keywords?: string, categorySlug?: string, pinId?: number, categorized?: Category[]}) => {

        searchState.currentPage = 1;
        searchState.pageLoading = true;
        searchState.products = [];

        // experimental
        searchState.relatedProducts = undefined;
        if (categorized) {
            searchState.categorized = true;
            searchState.categoryOrder = categorized.map(category => ({
                ...category,
                done: false,
            }));
        }

        // get products
        const products = !categorized ? (await getProducts({
            search: keywords,
            categorySlug,
            page: 1,
            take: perPage,
        })) : (
            await getProducts({
                categorySlug: categorized[0]?.slug,
            })
        );

        // experimental
        if (!products.error) {

            searchState.search = {
                keywords: keywords || undefined,
                categorySlug: categorySlug || undefined,
                pinId: pinId || undefined,
            };

            // pin stuff
            const pinIndex = products?.products.findIndex(product => product.id === pinId);
            if (pinIndex > -1) {
                products?.products.splice(pinIndex, 1);
            }

            if (pinId) {
                const product = await getProduct(pinId);
                if (product) {
                    products.products.unshift(product);
                }
            }
            // pin stuff end

            if (!products.products[0]) {
                // products.products[0] = {
                //     isFirst: true
                // }
            } else {
                products.products[0].isFirst = true;
            }


            searchState.products = products.products;
            searchState.totalPage = products.totalPage;


        } else {
            searchState.products = [];
            searchState.totalPage = 1;
        }
        searchState.pageLoading = false;


        // experimental
        if (!products.error && keywords) {
            const firstProduct = products.products[0];
            if (firstProduct) {
                const categoryId = firstProduct.categoryId;
                const categorySlug = frontState.categories.find(c => c.id === categoryId)?.slug;

                const relatedProducts = await getProducts({
                    categorySlug,
                    page: 1,
                    take: 10,
                });

                // remove first product
                relatedProducts.products = relatedProducts.products.filter(p => p.id !== firstProduct.id);

                if (!relatedProducts.error) {
                    searchState.relatedProducts = relatedProducts.products;
                }
            }
        }
    },
    clear: async () => {
        searchState.search = {};
        searchState.products = [];
        searchState.totalPage = 0;
        searchState.currentPage = 0;
        searchState.pageLoading = false;
        searchState.categorized = false;
        searchState.categoryOrder = undefined;
        searchState.hasMore = true;
    },
};

