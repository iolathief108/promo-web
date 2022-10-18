import {useSnapshot} from 'valtio';
import frontState from '../../states/front';
import {getImageUrl} from '../../lib/config';
import {searchState} from '../../states/search';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {getUrl} from '../../lib/utils';
import {Category} from '@prisma/client';

function CategoryItem({category}: {category: Category}) {

    const {search} = useSnapshot(searchState);

    if (!category || !category.imageId) {
        return null;
    }

    const InnerItem = () => {
        if (!category?.imageId) {
            return null;
        }
        return (
            <>
                <img height={150} width={150} src={getImageUrl(category.imageId)} alt={category.name}
                     className={'image'}/>
                <div className={'name'} style={{
                    whiteSpace: 'nowrap',
                }}>{category.name}</div>
            </>
        );
    };

    return (
        <Link  href={getUrl({categorySlug: category.slug})}>
            <a className={'item mx-0 mx-sm-3' + ( search.categorySlug === category.slug ? ' active': '' )}
               style={{
                   width: '95px'
               }}>
                <InnerItem/>
            </a>
        </Link>
    );
}

export function Cats() {
    const {categories} = useSnapshot(frontState);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (categories.length > 0) {
            setLoading(false);
        }
    }, [categories]);

    if (loading && categories.length === 0) {
        return null;
    }

    const getTotalWidth = () => {
        return 95 * categories.length + 24;
    }

    return (
        <div className={'cats-outer'} style={{
            // marginLeft: '-.75rem',
            // marginRight: '-.75rem'
        }}>
            <div className={'wrap'} style={{
                width: getTotalWidth(),
                margin: 'auto'
            }}>
                <div className={'cats-inner pb-1 pb-sm-0'} style={{
                    paddingRight: '.75rem',
                    paddingLeft: '.75rem'
                }}>
                    {
                        categories?.map((category, index) => {
                            return (
                                <CategoryItem key={index} category={category}/>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
}
