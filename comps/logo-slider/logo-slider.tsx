import {useSnapshot} from 'valtio';
import {useHasHydrated} from '../../lib/utils';
import frontState from '../../states/front';
import Slider, {Settings} from '@ant-design/react-slick';


interface Props {
    isPaynow: boolean;
    onPay: (e?: any) => any;
    isDisable?: boolean;
}

const logoUrls = [
    'https://www.paypalobjects.com/webstatic/mktg/logo/AM_mc_vs_dc_ae.jpg',
    'https://www.paypalobjects.com/webstatic/mktg/logo/AM_mc_vs_dc_ae.jpg',
    'https://www.paypalobjects.com/webstatic/mktg/logo/AM_mc_vs_dc_ae.jpg',
    'https://www.paypalobjects.com/webstatic/mktg/logo/AM_mc_vs_dc_ae.jpg',
    'https://www.paypalobjects.com/webstatic/mktg/logo/AM_mc_vs_dc_ae.jpg',
    'https://www.paypalobjects.com/webstatic/mktg/logo/AM_mc_vs_dc_ae.jpg',
    'https://www.paypalobjects.com/webstatic/mktg/logo/AM_mc_vs_dc_ae.jpg',
];

// logo slider using react-slick
export function LogoSlider(props: Props | {}) {

    const hasHydrated = useHasHydrated();

   if (logoUrls.length === 0) {
        return null;
    }

    return (
        <div className={'home-slider'}>
            <Carousel urls={logoUrls}/>
        </div>
    );
}



type ItemProps = {
    url: string
}
const Item = ({url}: ItemProps) => {
    return (
        <div style={{
            // height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <img
                style={{
                    width: '100%',
                    // height: '100%',
                    objectFit: 'contain',
                    maxWidth: 140,
                }}
                src={url}
                onLoad={() => {
                    frontState.mainBannerLoaded = true;
                }}
                onLoadStart={() => {
                    setTimeout(() => {
                        frontState.mainBannerLoaded = true;
                    }, 250);
                }}
            />
        </div>
    );
};


type CarouselProps = {
    urls: readonly string[]
}

// this is the carousel component for the logo slider, multiple logos displayed in a slider
export function Carousel(props: CarouselProps) {

    const {mainBannerLoaded, noDodLoaded} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();

    const settings: Settings = {
        infinite: true,
        speed: 700,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                }
            },
            // {
            //     breakpoint: 480,
            //     settings: {
            //         slidesToShow: 2,
            //     }
            // }
        ]
    };

    const getUrls = () => {
        if (hasHydrated) {
            return props.urls;
        } else {
            return [props.urls[0]];
        }
    };

    return (
        <div style={{
            width: '100%',
        }}>
            <Slider {...settings}>
                {
                    getUrls().map((value, index) => <Item key={index} url={value}/>)
                }
            </Slider>
        </div>
    );
}
