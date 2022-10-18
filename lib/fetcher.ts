import axios, {AxiosError, AxiosRequestConfig, AxiosResponse} from 'axios';
import {apiBase, devPort, getImageUrl, isDevelopment} from './config';
import {Order, OrderItem, Product, User} from '@prisma/client';
import {useEffect, useState} from 'react';


export const Fetcher = axios.create({
    baseURL: isDevelopment ? `http://localhost:${devPort}${apiBase}` : apiBase,
    timeout: 80000,
});

export const useFetcher = {

    Get<T = unknown, R = AxiosResponse<T>, D = any>(
        url: string, config?: AxiosRequestConfig<D> & {effect?: boolean}) {

        const [response, setResponse] = useState<AxiosResponse<T>>();
        const [error, setError] = useState<AxiosError>();
        const [loading, setLoading] = useState(true);

        const fetchData = async (url: string, config?: AxiosRequestConfig<D>) => {
            try {
                setLoading(true);
                const result = await Fetcher.get<T>(url, config);
                setResponse(result);
            } catch (err) {
                setError(err as AxiosError);
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            if (config?.effect === true) {
                fetchData(url, config);
            }
        }, []);

        useEffect(() => {
            if (config?.effect === true) {
                fetchData(url, config);
            }
        }, [url]);

        const fetch = () => {
            fetchData(url, config);
        };

        return {response, error, loading, fetch};
    },
    Post<T = unknown, R = AxiosResponse<T>, D = any>(
        url: string, config?: AxiosRequestConfig<D>) {

        const [response, setResponse] = useState<AxiosResponse<T>>();
        const [error, setError] = useState<string>();
        const [loading, setLoading] = useState(true);

        const fetchData = async (url: string, data?: D, config?: AxiosRequestConfig<D>) => {
            try {
                setError(undefined);
                setLoading(true);
                const result = await Fetcher.post<T>(url, data, config);
                setResponse(result);
            } catch (err) {
                // @ts-ignore
                const message = err?.response?.data?.error;

                setError(message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        const fetch = (data?: D) => {
            fetchData(url, data, config);
        };
        return {response, error, loading, fetch};
    },
};


type GetProductsParam = {search?: string, categorySlug?: string | string[], take?: number, page?: number}

export const getProducts = async (query: GetProductsParam): Promise<{products: ( Product & {isFirst?: boolean})[], totalPage: number, error?: string}> => {
    try {
        const res = await Fetcher.get<{products: Product[], totalPage: number}>('/products', {
            params: {
                search: query.search,
                category: typeof query.categorySlug === 'string' ? query.categorySlug : query.categorySlug?.[0],
                take: query.take,
                page: query.page,
            },
        });

        return res.data;
    } catch (e) {
        if (typeof window !== 'undefined') {
            console.log(e);
        }
        return {
            products: [],
            totalPage: 1,
            error: 'Error fetching products',
        };
    }
};

export const getProduct = async (id: number): Promise<Product | undefined> => {
    try {
        const res = await Fetcher.get<Product>(`/product/${id}`);
        return res.data;
    } catch (e) {

        // console.log(e);
        return undefined;
    }
};

export const getProfile = async (): Promise<User | undefined> => {
    try {
        const res = await Fetcher.get<{user: User}>('/user/profile');
        return res.data.user;
    } catch (e) {
        // console.log(e);
        return undefined;
    }
};

export const getBanners = async (): Promise<{bannerA?: string; bannerB?: string; bannerC?: string;}> => {
    try {
        const res = await Fetcher.get<{key: string, value: number}[]>('/admin/docs');

        const bannerAID = res.data.find(x => x.key === 'bannerA')?.value;
        let bannerAURL = bannerAID ? getImageUrl(bannerAID) : undefined;
        const bannerBID = res.data.find(x => x.key === 'bannerB')?.value;
        let bannerBURL = bannerBID ? getImageUrl(bannerBID) : undefined;
        const bannerCID = res.data.find(x => x.key === 'bannerC')?.value;
        let bannerCURL = bannerCID ? getImageUrl(bannerCID) : undefined;

        return {
            bannerA: bannerAURL,
            bannerB: bannerBURL,
            bannerC: bannerCURL,
        };

    } catch (e) {
        // console.log(e);
        return {};
    }
};

type catType = {
    id: number,
    name: string,
    slug: string,
    imageId: number,
}
var global = {};

export type TFrontDocs = {cats: catType[], dods: {imageId: number, productId: number}[], shippingCharge: number, sliders: {imageId: number}[]}

export const getFrontDocs = async (ssr?:  {docs: any, cats: any}) => {

    type retType = {
        docs: {
            key: string,
            value: string,
        }[],
        cats: catType[]
    }

    try {

        // @ts-ignore
        if (typeof window !== 'undefined') {
            global = window;
        }

        let res = ssr && typeof window === 'undefined' ?
            {
                data: {
                    docs: ssr.docs,
                    cats: ssr.cats,
                }
            } :
            // @ts-ignore
            (global?.frontDocs as ({data: retType} | undefined)) || await Fetcher.get<retType>('/docs');

        if (ssr && typeof window === 'undefined') {
             res = {
                data: {
                    docs: ssr.docs,
                    cats: ssr.cats,
                }
             }
        }

        // @ts-ignore
        global.frontDocs = res?.data ? res : undefined;


        let dods: {
            imageId: number,
            productId: number,
        }[] = [];
        let sliders: {imageId: number}[] = [];
        let shippingCharge: number = 0;

        // console.log(res.data);
        res.data.docs.forEach(y => {
            if (y.key === 'shippingCharge') {
                shippingCharge = Number(y.value);
            }

            // dod image
            if (y.key.includes('dod') && !y.key.includes('Product')) {
                const key = y.key.replace('dod', '');
                if (Number.isInteger(Number(key))) {
                    const numberKey = Number(key);
                    let id: number = JSON.parse(y.value);
                    if (id) {
                        // dods[numberKey] = {
                        //     imageUrl: getImageUrl(id),
                        // }
                        dods[numberKey] = {
                            ...(dods[numberKey] || {}),
                            imageId: id,
                        };
                    }
                }
            }

            // dod product id
            if (y.key.includes('ProductId')) {
                let key = y.key.replace('ProductId', '');
                key = key.replace('dod', '');
                if (Number.isInteger(Number(key))) {
                    const numberKey = Number(key);
                    let id: number = JSON.parse(y.value);
                    if (id) {
                        dods[numberKey] = {
                            ...(dods[numberKey] || {}),
                            productId: id,
                        };
                    }
                }
            }

            // slider image
            if (y.key.includes('slider')) {
                // remove prefix
                const key = y.key.replace('slider', '');
                // is key a number?
                if (Number.isInteger(Number(key))) {
                    // convert key to number
                    const numberKey = Number(key);
                    let id: number = JSON.parse(y.value);
                    if (id) {
                        sliders[numberKey] = {
                            imageId: id,
                        };
                    }
                }
            }
        });
        // if dod index-0 empty then remove it
        if (!dods[0]) {
            dods.shift();
        }
        // if slider index-0 empty then remove it
        if (!sliders[0]) {
            sliders.shift();
        }

        // res.data
        return {
            dods,
            sliders,
            shippingCharge,
            cats: res.data.cats as catType[],
        };

    } catch (e) {
        if (typeof window !== 'undefined') {
            console.log(e);
        }
        return {};
    }
};

export const getCategories = async (): Promise<catType[]> => {
    try {
        return (await getFrontDocs()).cats || [];
    } catch (e) {
        if (typeof window !== 'undefined') {
            console.log(e);
        }
        return [];
    }
};

export const getDod = async (): Promise<{imageId: number, productId: number}[]> => {
    try {
        return (await getFrontDocs())?.dods || [];
    } catch (e) {
        if (typeof window !== 'undefined') {
            console.log(e);
        }
        return [];
    }
};

export const getSliders = async (): Promise<{imageId: number}[]> => {
    try {
        return (await getFrontDocs())?.sliders || [];
    } catch (e) {
        if (typeof window !== 'undefined') {
            console.log(e);
        }
        return [];
    }
};

// Admin Orders
type fd = Order & {items: (OrderItem & {product: {imageId: number} | null})[]}

// (Order & {items: (OrderItem & {product: {imageId: number} | null})[]})[]
export interface ResOrder extends fd {
    orderStatus: 'pending' | 'processing' | 'completed' | 'cancelled';
    paymentStatus: 'paid' | 'unpaid' | 'refunded';
}

type GetAdminOrdersParam = {
    sort?: 'date_asc' | 'date_desc';
    state?: 'all' | 'pending' | 'processing' | 'completed' | 'cancelled';
    take?: number,
    page?: number
}
export const getAdminOrders = async (query: GetAdminOrdersParam): Promise<{orders: ResOrder[], totalPage: number, error?: string}> => {
    try {
        const res = await Fetcher.get<{orders: ResOrder[], totalPage: number}>('/admin/orders', {
            params: {
                sort: query.sort,
                filter: query.state,
                take: query.take,
                page: query.page,
            },
        });

        return res.data;
    } catch (e) {
        if (typeof window !== 'undefined') {
            console.log(e);
        }
        return {
            orders: [],
            totalPage: 1,
            error: 'Error fetching orders',
        };
    }
};

type UpdateOrderStatusParam = {
    orderId: number;
    orderStatus?: 'pending' | 'processing' | 'completed' | 'cancelled';
    paymentStatus?: 'paid' | 'unpaid' | 'refunded';
}
export const updateAdminOrderStatus = async (param: UpdateOrderStatusParam): Promise<{success: boolean, error?: string}> => {
    try {
        await Fetcher.post<{success: boolean}>('/admin/order/', param);
        return {
            success: true,
        };
    } catch (e) {
        console.log(e);
        return {
            success: false,
            error: 'Error updating order status',
        };
    }
};


// User Orders
type GetUserOrdersParam = {
    take?: number,
    page?: number
}
export const getUserOrders = async (query: GetUserOrdersParam): Promise<{orders: ResOrder[], error?: string}> => {
    try {
        const res = await Fetcher.get<{orders: ResOrder[]}>('/order/list', {
            params: {
                take: query.take,
                page: query.page,
            },
        });

        return res.data;
    } catch (e) {
        // console.log(e);
        return {
            orders: [],
            error: 'Error fetching orders',
        };
    }
};
