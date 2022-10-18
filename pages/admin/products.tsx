import type {NextPage} from 'next';
import type {Product} from '@prisma/client';
import {Category} from '@prisma/client';
import AdminLayout from '../../layouts/admin';
import Link from 'next/link';
import {useEffect, useState} from 'react';
import {changePerPage} from '../../lib/config';
import {useSnapshot} from 'valtio';
import {searchActions, searchState} from '../../states/search';
import {Fetcher} from '../../lib/fetcher';
import {getQuery} from '../../lib/utils';
import {prisma} from '../../prisma';
import frontState from '../../states/front';


const Admin: NextPage = (props: any) => {
    const {products} = useSnapshot(searchState);

    useEffect(() => {
        changePerPage(10);
        searchActions.search({});

        frontState.categories = props?.categories || [];

        return () => {
            searchActions.clear();
            // changePerPage(5);
        };
    }, []);

    return (
        <AdminLayout>

            <div className="container admin-home ms-0">
                <div className={'d-flex align-items-center'}>
                    <h1 className={'mb-2'}>List of products</h1>
                    <Link href="/admin/create">
                        <a className={'ms-4'}>
                            New product
                        </a>
                    </Link>
                </div>
                <SearchBox/>
                <div className={'mb-4'}/>
                <div className="bg-secondary bg-opacity-10 clearfix">
                    {products?.map(product => (
                        <ProductRow key={product.id} product={product}/>
                    ))}
                    {
                        products?.length === 0 && (
                            <div className={'text-center mt-2'}>
                                <h1>No products found</h1>
                            </div>
                        )
                    }
                </div>
                <Pagination/>
            </div>
        </AdminLayout>
    );
};

const Pagination = () => {
    const {totalPage, currentPage} = useSnapshot(searchState);

    return (
        <div className={'pagination mb-6 mt-5 align-center d-flex justify-content-center'}>
            {currentPage > 1 && (
                <button className={'btn btn-primary'} onClick={() => searchActions.prevPage()}>
                    Previous
                </button>
            )}
            {Array.from({length: totalPage}, (_, i) => (
                <button className={'btn btn-primary '
                + (currentPage === i + 1 ? 'active' : '')
                } onClick={() => searchActions.paginate(i + 1)} key={i}>
                    {i + 1}
                </button>
            ))}
            {currentPage < totalPage && (
                <button className={'btn btn-primary'} onClick={() => searchActions.nextPage()}>
                    Next
                </button>
            )}
        </div>
    );
};

const SingleVariant = (props: any) => {
    return (
        <div className={'variant ' + props.className}>
            {/*<div className="name">{props.title}</div>*/}
            <div className={'d-flex align-items-center'}>
                <span className={'pe-0 d-inline-block'}>
                    {
                        props.stock ? <input type={'checkbox'} checked={true} disabled={true}/> :
                            <input type={'checkbox'} disabled={true}/>
                    }
                </span>
                <span className={'fw-bold ms-2' + ` ${props.qty === 0 && 'text-danger'}`}>
                    {props.qty}
                    {props.qty === null && '∞'}
                </span>
                <span className={'ps-0 offset-1'}>{props.name}</span>
                <span className={'offset-1'}>SGD {props.price}</span>
                {/*<span>{props.stock ? 'In Stock' : 'Out of Stock'}</span>*/}
            </div>
        </div>
    );
};

const ProductRow = ({product}: {product: Product & {imageId: number}}) => {

    const [deleted, setDeleted] = useState(false);

    const onDelete = async (e) => {
        // prevent default action
        e.preventDefault();

        // delete product
        if (window.confirm('Are you sure you want to delete this product?')) {
            const res = await Fetcher.get('/admin/delete?id=' + product.id);
            if (res.status === 200) {
                setDeleted(true);
            }
        }

    };

    if (deleted) {
        return null;
    }

    return (
        <div className={'clearfix product-card align-items-center row py-3 mx-2  mb-3 border-bottom'}>
            <div className={'col-1'}>{product.id}</div>
            <div className={'image col-1'}>
                <img className={'rounded-2 shadow'} src={`/api/im/${product.imageId}`} alt={product.name}/>
            </div>
            <div className={'col-2 align-middle name fw-bolder'}>{product.name}</div>
            <SingleVariant className={'col-3'} title={'Type 1'} name={product.variant1Name}
                           price={product.variant1Price} stock={product.variant1InStock} qty={product.variant1Qty}/>
            <SingleVariant className={'col-3 p-0'} title={'Type 2'} name={product.variant2Name}
                           price={product.variant2Price} stock={product.variant2InStock} qty={product.variant2Qty}/>
            <div className={'col-1'}>
                {
                    product.enabled ? <input type={'checkbox'} checked={true} disabled={true}/> :
                        <input type={'checkbox'} disabled={true}/>
                }
            </div>
            <div className={'col-1'}>
                <Link href={`/admin/edit/${product.id}`}> Edit </Link>
                <a className={'text-danger fw-bold mt-2 d-inline-block'} onClick={onDelete}> Delete </a>
            </div>
            {/*<div className={'col-1 offset-1'}>*/}
            {/*</div>*/}
        </div>
    );
};

const SearchBox = () => {

    const [searchText, setSearchText] = useState(searchState.search.keywords);
    const {search} = useSnapshot(searchState);
    const {categories} = useSnapshot(frontState);

    const onSearch = () => {
        searchActions.search(getQuery({key: searchText}));
    };

    const onCategoryChange = (slug) => {
        searchActions.search(getQuery({cat: slug}));
    };

    return (
        <div>
            <div className={'d-inline-flex position-relative'}>
                <input onKeyDown={
                    (e) => {
                        if (e.key === 'Enter') {
                            onSearch();
                        }
                    }
                }
                       className={'search-box'} placeholder={'Search for more products'} type="text" value={searchText}
                       onChange={(e) => setSearchText(e.target.value)}/>

                {
                    searchText && search.keywords && (
                        <button onClick={() => {
                            searchActions.search(getQuery({key: ''}));
                            setSearchText('');
                        }} className={'text-danger position-absolute'} style={{
                            top: '30%',
                            right: '0',
                            border: 'none',
                            background: 'transparent',
                            boxShadow: 'none',
                            padding: '0',
                            paddingRight: '0.5rem',
                        }}>
                            <i className={'fa fa-times'}/>
                        </button>
                    )
                }
            </div>

            <a onClick={e => {
                e.preventDefault();
                onSearch();
            }} className={'search-btn'}>
                Search
            </a>

            <div className={'mt-3'}>
                {
                    categories.map(category => (
                        <a key={category.id} className={'btn btn-primary me-3'
                        + (search.categorySlug === category.slug ? ' text-danger text-decoration-underline' : '')
                        } onClick={() => {
                            onCategoryChange(category.slug);
                        }}>{category.name}</a>
                    ))
                }
            </div>

        </div>
    );
};

export default Admin;

export const getServerSideProps = async () => {

    const categories: Category[] = await prisma.category.findMany();

    return {
        props: {
            categories,
        },
    };
};
