import {useSnapshot} from 'valtio';
import frontState from '../../states/front';
import Slider, {Settings} from '@ant-design/react-slick';
import {isDevelopment} from '../../lib/config';
import {useHasHydrated} from '../../lib/utils';


type ItemProps = {
    url: string
}
const Item = ({url}: ItemProps) => {
    return (
        <div style={{
            height: '100%',
        }}>
            <img
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
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

export function Carousel(props: CarouselProps) {

    const {mainBannerLoaded, noDodLoaded} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();

    const settings: Settings = {
        dots: false,
        infinite: true,
        speed: 700,
        slidesToShow: 1,
        slidesToScroll: 1,
        // autoplay: hasHydrated && mainBannerLoaded && noDodLoaded > 3 ? !isDevelopment : false,
        autoplay: true,
        autoplaySpeed: 3000,
        lazyLoad: !hasHydrated ? undefined : ((mainBannerLoaded && noDodLoaded > 3) ? undefined : 'ondemand'),
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                },
            },
        ],
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

export function HomeSlider() {
    const {sliderImageUrls} = useSnapshot(frontState);

    if (sliderImageUrls.length === 0) {
        return null;
    }

    return (
        <div className={'home-slider'}>
            <Carousel urls={sliderImageUrls}/>
        </div>
    );
}
