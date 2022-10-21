import type {NextPage, NextPageContext} from 'next';
import AdminLayout from '../../layouts/admin';
import React, {useEffect} from 'react';
import {Fetcher} from '../../lib/fetcher';
import {Category, Image, Product} from '@prisma/client';
import {proxy, useSnapshot} from 'valtio';
import Router from 'next/router';
import {prisma} from '../../prisma';
import {apiBase} from '../../lib/config';


interface Interface {
    categories: Category[];
    name: string;
    variant1Name?: string;
    variant1Price?: number;
    variant1InStock?: boolean;
    variant1Qty?: number;
    variant2Name?: string;
    variant2Price?: number;
    variant2InStock?: boolean;
    variant2Qty?: number;
    categoryId?: number;
    enabled?: boolean;
    imageSrc?: string;
    description?: string;
}

function createRandomName() {
    return Math.random().toString(36).substring(7);
}
function getRandomNumber() {
    // random number between 1 and 6
    return Math.floor(Math.random() * 6) + 1;
}
function getDescription() {
    return `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus adipisci alias Lorem ipsum dolor sit amet, consectetur.

Unit Price: 100 LKR
Min Qty: 10
    `
}

const productState = proxy<Interface>({
    categories: [],
    name: '',
    variant1Name: '',
    variant1Price: 0,
    variant1InStock: true,
    variant1Qty: undefined,
    variant2Name: '',
    variant2Price: 0,
    variant2InStock: true,
    variant2Qty: undefined,
    enabled: true,
    imageSrc: '',
    description: '',

    // remove
    categoryId: undefined,
});

function resetConfig() {
    productState.name = '';
    productState.variant1Name = '';
    productState.variant1Price = 0;
    productState.variant1InStock = true;
    productState.variant1Qty = undefined;
    productState.variant2Name = '';
    productState.variant2Price = 0;
    productState.variant2InStock = true;
    productState.variant2Qty = undefined;
    productState.categoryId = undefined
    productState.enabled = true;
    productState.imageSrc = '';
    productState.description = '';
}

const Create: NextPage = ({product, pid}: {product?: Product & {image: Image}, pid?: number}) => {

    const {
        name,
        variant1Name,
        variant1Price,
        variant1InStock,
        variant1Qty,
        variant2Name,
        variant2Price,
        variant2InStock,
        variant2Qty,
        categoryId,
        enabled,
        imageSrc,
        categories,
        description,
    } = useSnapshot(productState);

    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState<string>();

    const inputFileRef = React.useRef<HTMLInputElement | null>(null);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();

        setLoading(true);

        const formData = new FormData();

        // append files
        if (inputFileRef.current?.files?.length && imageSrc) {
            Object.values(inputFileRef?.current?.files || {}).forEach(file => {
                formData.append('image', file);
            });
        }

        // append fields
        Object.entries(productState).forEach(([key, value]) => {
            const theVal = {value: value};
            if (pid && key === 'imageSrc') {
                return;
            }
            formData.append(key, JSON.stringify(theVal));
        });

        if (pid) {
            formData.append('pid', JSON.stringify({value: pid}));
            Fetcher.post('admin/create', formData).then(() => {
                resetConfig();
                setLoading(false);
                // redirect to products page
                Router.push('/admin/products');
            }).catch(e => {
                // console.log(e);
                setError(e?.response?.data?.error ? e.response.data.error : 'Something went wrong');
                setLoading(false);

                // clear error after 8 seconds
                setTimeout(() => {
                    setError(undefined);
                }, 8000);

            });
        } else {
            // post request
            Fetcher.post('admin/create', formData).then(e => {
                setLoading(false);
                console.log(e.data);
                resetConfig();
                setSuccess(true);

                // set success to false in 5 seconds
                setTimeout(() => {
                    setSuccess(false);
                }, 5000);
            }).catch(e => {
                console.log(e);
                setError(e?.response?.data?.error ? e.response.data.error : 'Something went wrong');
                setLoading(false);

                // clear error after 8 seconds
                setTimeout(() => {
                    setError(undefined);
                }, 8000);

            });
        }
    };

    const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                productState.imageSrc = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        resetConfig();

        // init categories
        if (categories.length === 0) {
            Fetcher.get<{categories: Category[];} | null>('admin/category').then(e => {
                productState.categories = (e?.data?.categories || []);
            }).catch(e => {
                console.log(e);
            });
        }

        // init product
        if (typeof pid === 'number' && pid > 0) {
            productState.name = product?.name || '';
            productState.variant1Name = product?.variant1Name || '';
            productState.variant1Price = product?.variant1Price || 0;
            productState.variant1InStock = product?.variant1InStock || true;
            productState.variant1Qty = product?.variant1Qty === undefined || product?.variant1Qty === null ? undefined : product?.variant1Qty;
            productState.variant2Name = product?.variant2Name || '';
            productState.variant2Price = product?.variant2Price || 0;
            productState.variant2InStock = product?.variant2InStock || true;
            // productState.variant2Qty = product?.variant2Qty || undefined;
            productState.variant2Qty = product?.variant2Qty === undefined || product?.variant2Qty === null ? undefined : product?.variant2Qty;
            productState.categoryId = product?.categoryId || undefined;
            productState.enabled = product?.enabled || true;
            productState.description = product?.description || '';

            // init image
            if (product?.image) {
                // random number between 10 to 100
                const random = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
                productState.imageSrc = `${apiBase}im/${product.image.id}?${random}`;
            }
        }

    }, []);

    return (
        <AdminLayout>
            <div className="pcreate container ms-0">
                <h1 className="text-2xl font-bold mb-3">
                    {pid ? 'Edit Product' : 'Create Product'}
                </h1>
                <form onSubmit={onSubmit} style={{
                    opacity: loading ? 0.5 : 1,
                    pointerEvents: loading ? 'none' : 'auto',
                    cursor: loading ? 'not-allowed' : 'auto',
                }}>
                    <div className={'row'}>
                        <h3>Product Information</h3>
                        <div className="col-lg-6 col-xl-4 row">
                            <div className={'col-4'}>
                                <input className={'checkbox'} type="checkbox" name="isEnabled" id="product_enabled"
                                       checked={enabled || false}
                                       onChange={e => productState.enabled = e.target.checked}/>
                                <label htmlFor="product_enabled">
                                    {
                                        enabled ? 'Enabled' : 'Disabled'
                                    }
                                </label>
                            </div>

                            <div className={'col-8'}>
                                <ImageField
                                    imageUrl={imageSrc}
                                    onChange={onSelectImage}
                                    name={'product_image'}
                                    ref={inputFileRef}
                                    label={'Select Image'}
                                />
                            </div>
                        </div>
                        <div className="col-3">
                            <input placeholder={'product name'} type="text" name="name" id="name" value={name || ''}
                                   onChange={e => productState.name = e.target.value}/>
                            {
                                name.length > 14 &&
                                <span className="text-danger fw-semibold mr-3">
                                    Product name must be less than 14 characters (current: {name.length})
                                </span>
                            }
                        </div>
                        <div className="col-3">
                            {/*<label htmlFor="category">Select a Category</label>*/}
                            <div className="select-dropdown">

                                <select name="category" id="category" value={categoryId || -1}
                                        onChange={e => productState.categoryId = Number(e.target.value)}>
                                    {
                                        categoryId === undefined &&
                                        <option value={-1}>Select a Category</option>
                                    }
                                    {
                                        categories.map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                    </div>

                    {/*<div className={'row'}>*/}
                    {/*    <h3 className={'mt-5'}>Variant 1</h3>*/}
                    {/*    <div className="col-3">*/}
                    {/*        <label htmlFor="variant1Name">Name</label>*/}
                    {/*        <input type="text" name="Variant 1" id="variant1Name" value={variant1Name || ''}*/}
                    {/*               onChange={e => productState.variant1Name = e.target.value}/>*/}
                    {/*    </div>*/}

                    {/*    <div className="col-2">*/}
                    {/*        <label htmlFor={'variant1Price'}>Price</label>*/}
                    {/*        <input type="number" name="Variant 1" id={'variant1Price'} value={variant1Price || 0}*/}
                    {/*               onChange={e => productState.variant1Price = Number(e.target.value)}/>*/}
                    {/*    </div>*/}

                    {/*    <div className={'col-2'}>*/}
                    {/*        <label htmlFor="variant1Qty">Qty</label>*/}
                    {/*        <input type="number" name="Variant 1" id="variant1Qty"*/}
                    {/*               value={variant1Qty === undefined ? '' : `${variant1Qty}`}*/}
                    {/*               onChange={e => productState.variant1Qty = Number(e.target.value)}/>*/}
                    {/*    </div>*/}

                    {/*    <div className="col-2 checkbox">*/}
                    {/*        <label htmlFor="variant1InStock">Stock</label>*/}

                    {/*        <input className={'checkbox'} type="checkbox" name="Variant 1" id="variant1InStock"*/}
                    {/*               checked={variant1InStock || false}*/}
                    {/*               onChange={e => productState.variant1InStock = e.target.checked}/>*/}
                    {/*        /!*<input className={'checkbox'} type="checkbox" name="isEnabled" id="isEnabled" checked={enabled || false}*!/*/}
                    {/*        /!*       onChange={e => configState.enabled = e.target.checked}/>*!/*/}
                    {/*        <label htmlFor="variant1InStock">*/}
                    {/*            {*/}
                    {/*                // enabled ? 'Enabled' : 'Disabled'*/}
                    {/*            }*/}
                    {/*        </label>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<div className={'row'}>*/}
                    {/*    <h3 className={'mt-5'}>Variant 2</h3>*/}
                    {/*    <div className="col-3">*/}
                    {/*        <label htmlFor="variant2Name">Name</label>*/}
                    {/*        <input type="text" name="Variant 2" id="variant2Name" value={variant2Name || ''}*/}
                    {/*               onChange={e => productState.variant2Name = e.target.value}/>*/}
                    {/*    </div>*/}

                    {/*    <div className="col-2">*/}
                    {/*        <label htmlFor={'variant2Price'}>Price</label>*/}
                    {/*        <input type="number" name="Variant 2" id={'variant2Price'} value={variant2Price || 0}*/}
                    {/*               onChange={e => productState.variant2Price = Number(e.target.value)}/>*/}
                    {/*    </div>*/}

                    {/*    <div className={'col-2'}>*/}
                    {/*        <label htmlFor="variant2Qty">Qty</label>*/}
                    {/*        <input type="number" name="Variant 2" id="variant2Qty"*/}
                    {/*               value={variant2Qty === undefined ? '' : variant2Qty}*/}
                    {/*               onChange={e => productState.variant2Qty = Number(e.target.value)}/>*/}
                    {/*    </div>*/}

                    {/*    <div className="col-2 checkbox">*/}
                    {/*        <label htmlFor="variant2InStock">Stock</label>*/}
                    {/*        <input className={'checkbox'} type="checkbox" name="Variant 2" id="variant2InStock"*/}
                    {/*               checked={variant2InStock || false}*/}
                    {/*               onChange={e => productState.variant2InStock = e.target.checked}/>*/}
                    {/*        <label htmlFor="variant2InStock"/>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    <div className={'row'}>
                        <h3 className={'mt-5'}>Description</h3>
                        <div className="col-12">
                            <textarea name="description" id="description" cols={30} rows={10}
                                        value={description || ''}
                                        onChange={e => productState.description = e.target.value}/>
                        </div>
                    </div>

                    <input className={'mt-6'} type="submit" value="Submit"/>
                    {
                        success &&
                        <div className="text-success mt-2 fw-bold">
                            <i className="fas fa-check-circle"/> Product created successfully
                        </div>
                    }
                    {
                        error &&
                        <div className="text-danger mt-2 fw-bold">
                            <i className="fas fa-times-circle"/> {error}
                        </div>
                    }
                </form>
            </div>
        </AdminLayout>
    );
};

export default Create;

export const getServerSideProps = async (ctx: NextPageContext) => {
    const {pid} = ctx.query;

    if (pid === undefined) {
        return {props: {}};
    }

    let product = await prisma.product.findUnique({
        where: {
            id: Number(pid),
        },
        include: {
            image: {
                select: {
                    id: true,
                },
            },
        },
    });

    if (!product) {
        return {props: {}};
    }
    product.createdAt = product.createdAt.toISOString() as any;

    return {
        props: {
            pid: Number(pid),
            product: product ? product : null,
        },
    };
};

const Image = ({imageSrc}: any) => {
    return (
        <div className={'position-relative'}>
            <img src={imageSrc}/>
        </div>
    );
};

const ImageField = React.forwardRef((
    props: {
        imageUrl?: string;
        onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
        name: string;
        label?: string
    },
    ref: any,
) => {

    return (
        <>
            <label htmlFor={props.name} className={'img-label'
            + (props.imageUrl ? ' has-image' : '')}>

                {props.imageUrl ? 'Change Image' : 'Choose Image'}
                <input id={props.name} type="file" name={props.name} ref={ref} onChange={props.onChange}
                       accept="image/jpeg, image/png" className={'mb-2'}/>
            </label>
            {
                props.imageUrl && <Image imageSrc={props.imageUrl}/>
            }
        </>
    );
});
