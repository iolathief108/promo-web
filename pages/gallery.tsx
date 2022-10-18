import type {NextPage} from 'next';
import {Header} from '../comps/header/header';
import {Cats} from '../comps/cats/cats';
import {Container} from '../comps/container';
import {useSnapshot} from 'valtio';
import frontState from '../states/front';
import {useHasHydrated} from '../lib/utils';
import {Background} from '../comps/background';
import {Banner} from '../comps/banner';
import Head from 'next/head';
import {useState} from 'react';
import {Gallery, Image} from 'react-grid-gallery';

import FsLightbox from 'fslightbox-react';


const images: Image[] = [
    {
        src: 'https://c2.staticflickr.com/9/8817/28973449265_07e3aa5d2e_b.jpg',
        width: 320,
        height: 174,
        caption: 'After Rain (Jeshu John - designerspics.com)',
    },
    {
        src: 'https://c2.staticflickr.com/9/8356/28897120681_3b2c0f43e0_b.jpg',
        width: 320,
        height: 212,
        caption: 'Boats (Jeshu John - designerspics.com)',
    },
    {
        src: 'https://c4.staticflickr.com/9/8887/28897124891_98c4fdd82b_b.jpg',
        width: 320,
        height: 212,
        caption: 'Color Pencils (Jeshu John - designerspics.com)',
    },
    {
        src: 'https://c7.staticflickr.com/9/8546/28354329294_bb45ba31fa_b.jpg',
        width: 320,
        height: 213,
        caption: 'Red Apples with other Red Fruit (foodiesfeed.com)',
    },
    {
        src: 'https://c6.staticflickr.com/9/8890/28897154101_a8f55be225_b.jpg',
        width: 320,
        height: 183,
        caption: '37H (gratispgraphy.com)',
    },
    {
        src: 'https://c5.staticflickr.com/9/8768/28941110956_b05ab588c1_b.jpg',
        width: 240,
        height: 320,
        caption: '8H (gratisography.com)',
    },
    {
        src: 'https://c3.staticflickr.com/9/8583/28354353794_9f2d08d8c0_b.jpg',
        width: 320,
        height: 190,
        caption: '286H (gratisography.com)',
    },
    {
        src: 'https://c7.staticflickr.com/9/8569/28941134686_d57273d933_b.jpg',
        width: 320,
        height: 148,
        caption: '315H (gratisography.com)',
    },
];

const GalleryPage: NextPage = () => {
    const {bannerA, bannerB, bannerC} = useSnapshot(frontState);
    const hasHydrated = useHasHydrated();
    const {searchContainerMargin, windowWidth} = useSnapshot(frontState);

    const [index, setIndex] = useState(3);
    const [toggler, setToggler] = useState(false);
    const handleClick = (index: number, item: Image) => {
        setToggler(!toggler);
    };

    return (
        <>
            <Header/>
            <Head>
                <title>
                    Gallery - NeatKitch
                </title>
            </Head>
            <Container className="container search">
                <Cats/>
                <div className={'mt-5 text-left'} style={{
                    marginLeft: hasHydrated ? searchContainerMargin : 0,
                    marginRight: hasHydrated ? searchContainerMargin : 0,
                }}>
                    <h1>Gallery</h1>
                    <Gallery
                        images={images}
                        onClick={handleClick}
                        enableImageSelection={false}
                    />
                    <FsLightbox
                        toggler={toggler}
                        sources={
                            images.map((image) => image.src)
                        }
                    />
                </div>
            </Container>


            <Background withMargin align={'right'} bg={'/static/images/right-bg.jpg'}/>
            {
                windowWidth > 1200 &&
                <>
                    <Banner align={'left'} bannerLarge={bannerA}/>
                    <Banner align={'right'}
                            bannerTop={bannerB}
                            bannerBottom={bannerC}/>
                </>
            }
        </>
    );
};

export default GalleryPage;
