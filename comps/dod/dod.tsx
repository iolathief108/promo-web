import {useSnapshot} from 'valtio';
import frontState from '../../states/front';
import Link from 'next/link';
import Image from 'next/image';


export function Dod() {
    const {dods} = useSnapshot(frontState);

    // if (!mainBannerLoaded) {
    //     return null;
    // }

    return (
        <div className={'home-dod pb-4 px-4'}>
            <h2 className={'pt-4 pb-2 fw-bold'}>Deals of the day!</h2>
            <div className={'content mt-3 row'}>
                {
                    dods?.map((dod, index) => {

                        return (
                            <Link href={dod?.id ? '/search?pin=' + dod.id : '/search'}  key={index}>
                                <a key={index} className={'dod-item mb-4 col-6 col-sm-6 col-lg-3'}>
                                    <div className={'image-wrapper'}>
                                        <img className={'rounded-2 shadow'} src={dod.imageUrl} alt="Deals of the day!"/>
                                        {/*<Image onLoadingComplete={() => {*/}
                                        {/*    frontState.noDodLoaded++*/}
                                        {/*}} src={dod.imageUrl} alt="Deals of the day!" height={300} width={400}  objectFit={'cover'} className={'rounded-2 shadow'}/>*/}
                                    </div>
                                </a>
                            </Link>
                        );
                    })
                }
            </div>
        </div>
    );
}
