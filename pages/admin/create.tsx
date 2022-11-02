import type {NextPage, NextPageContext} from 'next';
import AdminLayout from '../../layouts/admin';
import React, {useEffect, useState} from 'react';
import {Fetcher} from '../../lib/fetcher';
import {Category, Image, Product} from '@prisma/client';
import {proxy, useSnapshot} from 'valtio';
import Router from 'next/router';
import {prisma} from '../../prisma';
import {apiBase} from '../../lib/config';
import dynamic from 'next/dynamic';
import {EditorProps} from 'react-draft-wysiwyg';
// import htmlToDraft from 'html-to-draftjs';
import draftToHtml from 'draftjs-to-html';

// const htmlToDraft = dynamic(() => import('html-to-draftjs').then(
//     mod => mod.default),
//     {ssr: false});
let htmlToDraft = null;
if (typeof window === 'object') {
    htmlToDraft = require('html-to-draftjs').default;
}
const Editor = dynamic<EditorProps>(
    () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
    {ssr: false},
);

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import {ContentState, convertToRaw, EditorState} from 'draft-js';


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
    productState.categoryId = undefined;
    productState.enabled = true;
    productState.imageSrc = '';
    productState.description = '';
}

const Create: NextPage = ({product, pid}: {product?: Product & {image: Image}, pid?: number}) => {

    const {
        name,
        categoryId,
        enabled,
        imageSrc,
        variant1Qty,
        categories,
    } = useSnapshot(productState);

    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [desc, setDesc] = React.useState('');
    const [editorState, setEditorState] = useState<any>(EditorState.createEmpty());
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
            if (key === 'description') {
                return;
            }

            formData.append(key, JSON.stringify(theVal));
        });
        //add desc
        // formData.append('description', JSON.stringify({value: desc}));
        formData.append('description', JSON.stringify({
            value: draftToHtml(convertToRaw(editorState.getCurrentContent()))
        }));


        if (pid) {
            formData.append('pid', JSON.stringify({value: pid}));
            Fetcher.post('admin/create', formData).then(() => {
                resetConfig();
                setDesc('');
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
                setDesc('');
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
            setDesc(product?.description || '');

            // wysiwyg
            if (product?.description) {
                const html = product.description;
                // @ts-ignore
                const contentBlock = htmlToDraft(html);
                if (contentBlock) {
                    const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                    const editorState = EditorState.createWithContent(contentState);
                    setEditorState(editorState);
                }
            }

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


                    <div className={'row'}>
                        <h3 className={'mt-5'}>Description</h3>
                        <div className="col-12">
                            <Editor
                                editorState={editorState as any}
                                wrapperClassName="demo-wrapper"
                                editorClassName="demo-editor"
                                editorStyle={{
                                    border: '1px solid #ccc',
                                    minHeight: '13rem',
                                    padding: '0.5rem',
                                    borderRadius: '0.25rem',
                                }}
                                onEditorStateChange={(editorState) => {
                                    setEditorState(editorState);
                                    // setDesc(convertToRaw(editorState.getCurrentContent()));
                                }}
                            />
                            {/*<textarea name="description" id="description" cols={30} rows={10}*/}
                            {/*            value={desc}*/}
                            {/*            onChange={e => setDesc(e.target.value)}/>*/}
                        </div>
                    </div>

                    {/* variation 1 Qty as Order (order) */}
                    <div className={'row mt-5'}>
                        <h3 className={'mt-5'}>Order (optional) </h3>
                        <div className="col">
                            <label htmlFor="variant1Qty">By default, the lease order is treated as having 0 😎</label>
                            <input type="number" name="Variant 1" id="variant1Qty"
                                   value={variant1Qty === undefined ? '' : `${variant1Qty}`}
                                   onChange={e => productState.variant1Qty = Number(e.target.value)}/>
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
