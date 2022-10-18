import {useEffect, useState} from 'react';
import Link from 'next/link';
import {getQuery, getUrl} from '../../lib/utils';
import {useRouter} from 'next/router';


interface Props {
    placeholder?: string;
}

const SearchBox = (props: Props) => {
    const router = useRouter();
    const {cat, key} = router.query;
    // const [searchText, setSearchText] = useState((Array.isArray(key) ? key[0] : key) || '');
    const [searchText, setSearchText] = useState(getQuery(router.query)?.keywords || '');

    useEffect(() => {
        setSearchText(Array.isArray(key) ? key[0] : key || '');
    }, [key]);

    return (
        <div>
            <div style={{
                position: 'relative',
            }}>
                <input onKeyDown={
                    (e) => {
                        if (e.key === 'Enter') {
                            router.push(getUrl({keywords: searchText || ''}));
                            // router.push(getUrl({keywords: searchText || '', categorySlug: cat || ''}));
                        }
                    }
                }
                       className={'search-box'} placeholder={props?.placeholder || 'Search for more products'}
                       type="text" value={searchText}
                       onChange={(e) => setSearchText(e.target.value)}
                />

                {
                    searchText && key && (
                        <Link href={getUrl({keywords: '', categorySlug: cat || ''})}>
                            <button style={{
                                background: 'none',
                                border: 'none',
                                position: 'absolute',
                                right: '0',
                                margin: '0',
                                height: '100%',
                                paddingRight: '10px',
                                boxShadow: 'none',
                                paddingTop: '5px',
                                color: '#B60C0C',
                            }} className={'ps-3 close'}>
                                {/*Clear*/}
                                <i className={'fa fa-times'}/>
                            </button>
                        </Link>
                    )
                }
                <div className={'d-none search-icon'}>
                    {/*<i className={'fa fa-search'}/>*/}
                    <i className="fa fa-light fa-magnifying-glass"/>
                </div>
            </div>
            <Link href={getUrl({keywords: searchText || ''})}>
                <a className={'search-btn'}>
                    Search
                </a>
            </Link>
        </div>
    );
};

export default SearchBox;
