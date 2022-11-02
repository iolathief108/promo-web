import type {NextPage} from 'next';
import React, {useEffect, useState} from 'react';
import {proxy, useSnapshot} from 'valtio';
import {Fetcher} from '../../lib/fetcher';
import {Category} from '@prisma/client';
import AdminLayout from '../../layouts/admin';
import {getImageUrl} from '../../lib/config';


interface Interface {
    listItems: {
        id: number,
        name: string,
        slug: string,
        imageUrl: string | null;
        isEditing: boolean
        productCount: number
        loading?: boolean
    }[];
    createItem?: boolean;
    loading?: boolean;
}

const configState = proxy<Interface>({
    listItems: [],
    createItem: false,
});

function reloadItems() {
    configState.loading = true;
    Fetcher.get<{categories: (Category & {image: {id: number} | null, _count: {products: number}})[]}>('admin/category').then(res => {

        configState.listItems = res.data.categories.map((item, index) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            imageUrl: item.image?.id ? getImageUrl(item.image?.id) : null,
            isEditing: false,
            productCount: item._count.products,
        }));
        configState.loading = false;
    });
}

const EditItem = ({id}: {id: number}) => {
    const {listItems} = useSnapshot(configState);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const item = listItems.find(item => item.id === id);

    const inputFileRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        // name to slug
        if (name !== item?.name) {
            setSlug(name.toLowerCase().replace(/ /g, '-'));
        }
    }, [name]);

    useEffect(() => {
        if (!item) {
            return;
        }
        setName(item.name);
        setSlug(item.slug);
        setImageUrl(item.imageUrl || '');
    }, []);

    if (!item) {
        return null;
    }

    const handleSubmit = (e: any) => {
        e?.preventDefault();

        // loading true
        configState.listItems = listItems.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    loading: true,
                };
            }
            return item;
        });

        const formData = new FormData();

        if (inputFileRef.current?.files?.length) {
            Object.values(inputFileRef?.current?.files || {}).forEach(file => {
                formData.append('image', file);
            });
        }
        formData.append('name', name);
        formData.append('slug', slug);
        formData.append('id', JSON.stringify({value: id}));

        // update item
        Fetcher.post('admin/category', formData).then(() => {
            // update state
            configState.listItems = configState.listItems.map(item => {
                if (item.id === id) {
                    return {
                        ...item,
                        name: name,
                        slug,
                        imageUrl: item.imageUrl + '?' + Math.random() * 10 || (imageUrl + '?' + Math.random() * 10),
                        isEditing: false,
                        loading: false,
                    };
                }
                return item;
            });
        }).catch((e) => {
            console.error(e);
        });
    };

    const handleDelete = (e: any) => {
        e?.preventDefault();

        // loading true
        configState.listItems = listItems.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    loading: true,
                };
            }
            return item;
        });
        const formData = new FormData();
        formData.append('deleteId', JSON.stringify({value: id}));

        // delete item
        Fetcher.post('admin/category', formData).then(() => {
            // update state
            configState.listItems = configState.listItems.filter(item => item.id !== id);
        }).catch((e) => {
            console.error(e);
        });
    };

    const handleCancel = (e: any) => {
        e?.preventDefault();
        configState.listItems = configState.listItems.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    isEditing: false,
                };
            }
            return item;
        });
    };

    const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{
            maxWidth: 500,
        }}>
            <form className={'bg-dark bg-opacity-10 p-3 rounded border-bottom'}>

                <div className={'mb-3 row'}>
                    <input className={'col'} placeholder={'Category Name'} value={name}
                           onChange={e => setName(e.target.value)}/>
                    <input className={'col'} placeholder={'Category Slug'} value={slug}
                           onChange={e => setSlug(e.target.value)}/>
                </div>
                <div style={{
                    maxWidth: 200,
                }}>
                    <label htmlFor={'cat-edit-image'} className={'img-label mt-4'
                    + (imageUrl ? ' has-image' : '')}>
                        {imageUrl ? 'Change Image' : 'Choose Image'}
                        <input type="file" id={'cat-edit-image'} name={'Category Image'} ref={inputFileRef}
                               onChange={onSelectImage}
                               accept="image/jpeg, image/png" className={'mb-2'}/>
                    </label>
                    {
                        imageUrl && (
                            <div>
                                <img style={{
                                    objectFit: 'contain',
                                }} src={imageUrl} width={50}/>
                            </div>
                        )
                    }
                </div>
                <div className={'mt-4'}>
                    <button className={'bg-danger text-white'} disabled={item.productCount > 0}
                            onClick={handleDelete}>Delete
                    </button>
                    <button onClick={handleCancel}>Cancel</button>
                    <button onClick={handleSubmit}
                            disabled={item.loading}>{item.loading ? 'Loading...' : 'Save'}</button>
                </div>
            </form>
        </div>
    );
};

const ListItem = ({id}: {id: number}) => {
    const {listItems} = useSnapshot(configState);

    const item = listItems.find(item => item.id === id);

    return (
        <div>

            <div className={'mb-4 row align-items-center border-bottom pb-3'} style={{
                display: item?.isEditing ? 'none' : 'flex',
                maxWidth: 500,
            }}>
                <div className={'col-auto'}>
                    <span className={'me-3'}>
                    ({item?.productCount || 0})
                    </span>
                    {
                        item?.imageUrl &&
                        <img width={'70px'} src={item?.imageUrl}/>
                    }
                </div>
                <span className={'col-6'} style={{}}>
                    {/*({item?.productCount || 0}) */}
                    {item?.name}
                    {/*{item?.id}*/}
                </span>
                <div className={'col-auto'}>
                    {
                        !item?.isEditing && <button onClick={() => {
                            configState.listItems = configState.listItems.map(item => {
                                if (item.id === id) {
                                    return {
                                        ...item,
                                        isEditing: true,
                                    };
                                }
                                return item;
                            });
                        }}>Edit</button>
                    }
                </div>
            </div>
            {item?.isEditing && <EditItem id={id}/>}
        </div>
    );
};

const CreateItem = () => {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');

    const [imageUrl, setImageUrl] = useState('');
    // image ref
    const inputFileRef = React.useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        // name to slug
        setSlug(name.toLowerCase().replace(/ /g, '-'));
    }, [name]);
    const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleSubmit = (e: any) => {
        e.preventDefault();
        // form data
        const formData = new FormData();
        formData.append('name', name);
        formData.append('slug', slug);
        if (inputFileRef.current?.files?.length) {
            Object.values(inputFileRef?.current?.files || {}).forEach(file => {
                formData.append('image', file);
            });
        }

        Fetcher.post('admin/category', formData).then(() => {
            configState.createItem = false;
            reloadItems();
        }).catch((e) => {
            console.error(e);
        });
    };

    return (
        <div style={{
            maxWidth: 500,
        }}>
            <form className={'bg-dark bg-opacity-10 p-3 rounded border-bottom'}>
                <div className={'mb-3 row'}>
                    <input className={'col'} placeholder={'Category Name'} value={name}
                           onChange={e => setName(e.target.value)}/>
                    <input className={'col'} placeholder={'Category Slug'} value={slug}
                           onChange={e => setSlug(e.target.value)}/>
                </div>
                <div style={{
                    maxWidth: 200,
                }}>
                    <label htmlFor={'create-cat'} className={'img-label mt-4'
                    + (imageUrl ? ' has-image' : '')}>
                        {imageUrl ? 'Change Image' : 'Choose Image'}
                        <input type="file" id={'create-cat'} name={'Category Image'} ref={inputFileRef}
                               onChange={onSelectImage}
                               accept="image/jpeg, image/png" className={'mb-2'}/>
                    </label>
                    {
                        imageUrl && (
                            <div>
                                <img style={{
                                    objectFit: 'contain',
                                }} src={imageUrl} width={50}/>
                            </div>
                        )
                    }
                </div>

                {/*<input type={'file'} ref={inputFileRef}/>*/}
                <div className={'mt-3'}>
                    <button onClick={handleSubmit}>Create</button>
                    <button onClick={() => {
                        configState.createItem = false;
                    }}>Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

const Categories: NextPage = () => {
    const {listItems, createItem, loading} = useSnapshot(configState);

    useEffect(() => {
        reloadItems();
    }, []);

    return (
        <AdminLayout>
            <div className="container ms-0">
                <h1>Categories</h1>
                {
                    !createItem && <button className={'px-3'} onClick={() => {
                        configState.createItem = true;
                    }}>Create New</button>
                }
                {createItem && <CreateItem/>}
                <div className={'mt-4'} style={{maxWidth: '900px'}}>
                    {listItems && listItems.map(item => (
                        <ListItem key={item.id} id={item.id}/>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Categories;
