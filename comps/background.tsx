import {useSnapshot} from 'valtio';
import frontState from '../states/front';
import {useHasHydrated} from '../lib/utils';


interface Props {
    align: 'left' | 'right';
    bg: string;
    withMargin?: boolean;
}

export function Background(props: Props) {
    const {isBgVisible, bgWidth, searchContainerMargin, mainBannerLoaded, noDodLoaded} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();

    if (!isBgVisible || !hasHydrated) {
        return null;
    }

    // if (!mainBannerLoaded || noDodLoaded < 3) {
    //     return null;
    // }

    return (
        <div style={{
            backgroundImage: `url(${props.bg})`,
            backgroundSize: 'cover',
            position: 'fixed',
            top: 0,
            left: props.align === 'left' ? 0 : undefined,
            right: props.align === 'right' ? 0 : undefined,
            backgroundPosition: props.align === 'right' ? 'left' : 'right',
            // width: `${bgWidth}px`,
            width: props.withMargin ? `${bgWidth + searchContainerMargin/2}px` : `${bgWidth}px`,
            height: '100%',
            zIndex: -1,
        }}/>
    );
}
