import frontState from '../states/front';
import {useSnapshot} from 'valtio';
import React, {useEffect} from 'react';
import {Footer} from './footer/footer';
import TawkTo from 'tawkto-react';
import {tawkConfig} from '../lib/config';
import {getCategories} from '../lib/fetcher';


interface ContainerProps {
    className?: string;
    children: React.ReactNode;
}

export function Container(props: ContainerProps) {

    const {headerHeight, mainBannerLoaded, noDodLoaded} = useSnapshot(frontState);
    const [isTawkLoaded, setIsTawkLoaded] = React.useState(false);

    // if not server side
    useEffect(() => {
        if (typeof window !== 'undefined') {

            if (mainBannerLoaded || noDodLoaded > 3 && !isTawkLoaded) {
                setTimeout(() => {
                    new TawkTo(tawkConfig.propertyId, tawkConfig.tawkId);
                    setIsTawkLoaded(true);
                }, 4000);
            }
            // const tawk = new TawkTo(tawkConfig.propertyId, tawkConfig.tawkId);
            // tawk.hideWidget()
        }
    }, [mainBannerLoaded, noDodLoaded]);

    useEffect(() => {

        getCategories().then((categories) => {
            frontState.categories = categories;
        });
    } , []);

    return (
        <>
            <div
                className={`${props.className || ''}`}
                style={{
                    marginTop: headerHeight || undefined,
                    minHeight: '95vh',
                    position: 'relative',
                }}
            >
                {props.children}


            </div>

            <div className="copywrite mt-4" style={{
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute',
                    bottom: '0',
                    width: '100%',
                }}>
                    <Footer/>
                </div>
                <div className="container text-center fs-6 invisible pt-4">
                    <Footer/>
                </div>
            </div>
        </>
    );
}
