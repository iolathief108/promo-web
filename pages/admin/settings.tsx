import {NextPage} from 'next';
import React, {useEffect} from 'react';
import {Fetcher} from '../../lib/fetcher';
import AdminLayout from '../../layouts/admin';
import {prisma} from '../../prisma';
import {getImageUrl} from '../../lib/config';
import Router from 'next/router';


interface Props {
    shippingCharge: number;
    dod1ProductId: number;
    dod2ProductId: number;
    dod3ProductId: number;
    dod4ProductId: number;
}

const Settings: NextPage<{urls: {[key: string]: string}} & Props> = (props) => {

    const [dod1Url, setDod1Url] = React.useState('');
    const [dod2Url, setDod2Url] = React.useState('');
    const [dod3Url, setDod3Url] = React.useState('');
    const [dod4Url, setDod4Url] = React.useState('');

    const [slider1Url, setSlider1Url] = React.useState('');
    const [slider2Url, setSlider2Url] = React.useState('');
    const [slider3Url, setSlider3Url] = React.useState('');
    const [slider4Url, setSlider4Url] = React.useState('');
    const [slider5Url, setSlider5Url] = React.useState('');
    const [slider6Url, setSlider6Url] = React.useState('');

    const [bannerAUrl, setBannerAUrl] = React.useState('');
    const [bannerBUrl, setBannerBUrl] = React.useState('');
    const [bannerCUrl, setBannerCUrl] = React.useState('');

    const [shippingCharge, setShippingCharge] = React.useState(0);
    const [dod1ProductId, setDod1ProductId] = React.useState<number | undefined>();
    const [dod2ProductId, setDod2ProductId] = React.useState<number | undefined>();
    const [dod3ProductId, setDod3ProductId] = React.useState<number | undefined>();
    const [dod4ProductId, setDod4ProductId] = React.useState<number | undefined>();

    const dod1 = React.useRef<HTMLInputElement | null>(null);
    const dod2 = React.useRef<HTMLInputElement | null>(null);
    const dod3 = React.useRef<HTMLInputElement | null>(null);
    const dod4 = React.useRef<HTMLInputElement | null>(null);

    const slider1 = React.useRef<HTMLInputElement | null>(null);
    const slider2 = React.useRef<HTMLInputElement | null>(null);
    const slider3 = React.useRef<HTMLInputElement | null>(null);
    const slider4 = React.useRef<HTMLInputElement | null>(null);
    const slider5 = React.useRef<HTMLInputElement | null>(null);
    const slider6 = React.useRef<HTMLInputElement | null>(null);

    const bannerA = React.useRef<HTMLInputElement | null>(null);
    const bannerB = React.useRef<HTMLInputElement | null>(null);
    const bannerC = React.useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (dod1Url) {
            return;
        }
        for (const key in props.urls) {
            // if key is dod1
            switch (key) {
                case 'dod1':
                    setDod1Url(props.urls[key]);
                    break;
                case 'dod2':
                    setDod2Url(props.urls[key]);
                    break;
                case 'dod3':
                    setDod3Url(props.urls[key]);
                    break;
                case 'dod4':
                    setDod4Url(props.urls[key]);
                    break;
                case 'slider1':
                    setSlider1Url(props.urls[key]);
                    break;
                case 'slider2':
                    setSlider2Url(props.urls[key]);
                    break;
                case 'slider3':
                    setSlider3Url(props.urls[key]);
                    break;
                case 'slider4':
                    setSlider4Url(props.urls[key]);
                    break;
                case 'slider5':
                    setSlider5Url(props.urls[key]);
                    break;
                case 'slider6':
                    setSlider6Url(props.urls[key]);
                    break;
                case 'bannerA':
                    setBannerAUrl(props.urls[key]);
                    break;
                case 'bannerB':
                    setBannerBUrl(props.urls[key]);
                    break;
                case 'bannerC':
                    setBannerCUrl(props.urls[key]);
                    break;
                default:
                    break;
            }
        }

        setShippingCharge(props.shippingCharge);
        setDod1ProductId(props.dod1ProductId || undefined);
        setDod2ProductId(props.dod2ProductId || undefined);
        setDod3ProductId(props.dod3ProductId || undefined);
        setDod4ProductId(props.dod4ProductId || undefined);
    }, []);

    const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {

        const id = e.currentTarget.id;
        if (id) {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    switch (id) {
                        case 'dod1':
                            setDod1Url(reader.result as string);
                            break;
                        case 'dod2':
                            setDod2Url(reader.result as string);
                            break;
                        case 'dod3':
                            setDod3Url(reader.result as string);
                            break;
                        case 'dod4':
                            setDod4Url(reader.result as string);
                            break;
                        case 'slider1':
                            setSlider1Url(reader.result as string);
                            break;
                        case 'slider2':
                            setSlider2Url(reader.result as string);
                            break;
                        case 'slider3':
                            setSlider3Url(reader.result as string);
                            break;
                        case 'slider4':
                            setSlider4Url(reader.result as string);
                            break;
                        case 'slider5':
                            setSlider5Url(reader.result as string);
                            break;
                        case 'slider6':
                            setSlider6Url(reader.result as string);
                            break;
                        case 'bannerA':
                            setBannerAUrl(reader.result as string);
                            break;
                        case 'bannerB':
                            setBannerBUrl(reader.result as string);
                            break;
                        case 'bannerC':
                            setBannerCUrl(reader.result as string);
                            break;
                        default:
                            break;
                    }
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const onClick = (e: any) => {
        e?.preventDefault();
        const formData = new FormData();
        if (dod1?.current?.files?.[0]) {
            formData.append('dod1', dod1?.current?.files?.[0]);
        }
        if (dod2?.current?.files?.[0]) {
            formData.append('dod2', dod2?.current?.files?.[0]);
        }
        if (dod3?.current?.files?.[0]) {
            formData.append('dod3', dod3?.current?.files?.[0]);
        }
        if (dod4?.current?.files?.[0]) {
            formData.append('dod4', dod4?.current?.files?.[0]);
        }
        if (slider1?.current?.files?.[0]) {
            formData.append('slider1', slider1?.current?.files?.[0]);
        }

        if (slider2?.current?.files?.[0]) {
            formData.append('slider2', slider2?.current?.files?.[0]);
        }
        if (slider3?.current?.files?.[0]) {
            formData.append('slider3', slider3?.current?.files?.[0]);
        }
        if (slider4?.current?.files?.[0]) {
            formData.append('slider4', slider4?.current?.files?.[0]);
        }
        if (slider5?.current?.files?.[0]) {
            formData.append('slider5', slider5?.current?.files?.[0]);
        }
        if (slider6?.current?.files?.[0]) {
            formData.append('slider6', slider6?.current?.files?.[0]);
        }

        if (bannerA?.current?.files?.[0]) {
            formData.append('bannerA', bannerA?.current?.files?.[0]);
        }
        if (bannerB?.current?.files?.[0]) {
            formData.append('bannerB', bannerB?.current?.files?.[0]);
        }
        if (bannerC?.current?.files?.[0]) {
            formData.append('bannerC', bannerC?.current?.files?.[0]);
        }

        formData.append('shippingCharge', JSON.stringify(''+shippingCharge));
        formData.append('dod1ProductId', JSON.stringify(dod1ProductId));
        formData.append('dod2ProductId', JSON.stringify(dod2ProductId));
        formData.append('dod3ProductId', JSON.stringify(dod3ProductId));
        formData.append('dod4ProductId', JSON.stringify(dod4ProductId));

        Fetcher.post('admin/docs', formData).then(res => {
            if (res.status === 200) {
                // redirect
                Router.push('/admin');
            }
        });
    };

    return (
        <AdminLayout>
            <div className="container ms-0">
                <h1>Settings</h1>
                <form>
                    {/*<div className="form-group mt-3">*/}
                    {/*    <SettingTitle title={'Shipping Charge'}/>*/}
                    {/*    /!*number input *!/*/}
                    {/*    <input style={{*/}
                    {/*        width: '200px',*/}
                    {/*    }} type={'number'} id="shippingCharge" placeholder="Shipping Charge" value={shippingCharge}*/}
                    {/*        // onChange={(e) => setShippingCharge((e.target.value))}*/}
                    {/*           onChange={(e) => setShippingCharge(parseFloat(e.target.value))}*/}
                    {/*    />*/}
                    {/*</div>*/}

                    {/*<div className="form-group mt-3 dod-set-cont">*/}
                    {/*    <SettingTitle title={'Deal of the Day'}/>*/}
                    {/*    <div className="content row">*/}
                    {/*        <ImageCol imageUrl={dod1Url} onChange={onSelectImage} name="dod1" ref={dod1}*/}
                    {/*                  text={dod1ProductId ? String(dod1ProductId) : ''}*/}
                    {/*                  onTextChange={(e) => Number(e.target.value) && setDod1ProductId(Number(e.target.value) || undefined)}*/}
                    {/*        />*/}
                    {/*        <ImageCol imageUrl={dod2Url} onChange={onSelectImage} name="dod2" ref={dod2}*/}
                    {/*                  text={dod2ProductId ? String(dod2ProductId) : ''}*/}
                    {/*                  onTextChange={(e) => Number(e.target.value) && setDod2ProductId(Number(e.target.value) || undefined)}*/}
                    {/*        />*/}
                    {/*        <ImageCol imageUrl={dod3Url} onChange={onSelectImage} name="dod3" ref={dod3}*/}
                    {/*                  text={dod3ProductId ? String(dod3ProductId) : ''}*/}
                    {/*                  onTextChange={(e) => Number(e.target.value) && setDod3ProductId(Number(e.target.value) || undefined)}*/}
                    {/*        />*/}
                    {/*        <ImageCol imageUrl={dod4Url} onChange={onSelectImage} name="dod4" ref={dod4}*/}
                    {/*                  text={dod4ProductId ? String(dod4ProductId) : ''}*/}
                    {/*                  onTextChange={(e) => Number(e.target.value) && setDod4ProductId(Number(e.target.value) || undefined)}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    <div className="form-group mt-3 slider-set-cont">
                        <SettingTitle title={'Sliders'}/>
                        <div className="content row">
                            <ImageCol  imageUrl={slider1Url} onChange={onSelectImage} name="slider1" ref={slider1}/>
                            <ImageCol  imageUrl={slider2Url} onChange={onSelectImage} name="slider2" ref={slider2}/>
                            <ImageCol  imageUrl={slider3Url} onChange={onSelectImage} name="slider3" ref={slider3}/>
                            <ImageCol  imageUrl={slider4Url} onChange={onSelectImage} name="slider4" ref={slider4}/>
                            <ImageCol  imageUrl={slider5Url} onChange={onSelectImage} name="slider5" ref={slider5}/>
                            <ImageCol  imageUrl={slider6Url} onChange={onSelectImage} name="slider6" ref={slider6}/>
                        </div>
                    </div>

                    <div className="form-group mt-3 banner-set-cont">
                        <SettingTitle title={'Long Banners'}/>
                        <div className="content row">
                            <ImageCol imageUrl={bannerAUrl} onChange={onSelectImage} name={'bannerA'} ref={bannerA}
                                      label={'Banner Large'}
                            />
                            <ImageCol imageUrl={bannerBUrl} onChange={onSelectImage} name={'bannerB'} ref={bannerB}
                                      label={'Banner Side Top'}
                            />
                            <ImageCol imageUrl={bannerCUrl} onChange={onSelectImage} name={'bannerC'} ref={bannerC}
                                      label={'Banner Side Bottom'}
                            />
                        </div>
                    </div>

                    <button className={'mt-4'} onClick={onClick}>Submit</button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default Settings;

export const getServerSideProps = async () => {
    const documents = await prisma.document.findMany();
    let urls: {
        [key: string]: string
    } = {};
    let shippingCharge = 0;
    let dod1ProductId: number | undefined;
    let dod2ProductId: number | undefined;
    let dod3ProductId: number | undefined;
    let dod4ProductId: number | undefined;

    for (const document of documents) {
        const value = JSON.parse(document.value)?.value;
        if (document.key.includes('dod') || document.key.includes('slider') || document.key.includes('banner')) {
            if (typeof value === 'number') {
                urls[document.key] = getImageUrl(value);
            }
        }
        if (document.key.includes('shippingCharge')) {
            shippingCharge = parseFloat(value);
        }
        if (document.key.includes('dod1ProductId')) {
            dod1ProductId = parseInt(value);
        }
        if (document.key.includes('dod2ProductId')) {
            dod2ProductId = parseInt(value);
        }
        if (document.key.includes('dod3ProductId')) {
            dod3ProductId = parseInt(value);
        }
        if (document.key.includes('dod4ProductId')) {
            dod4ProductId = parseInt(value);
        }
    }

    return {
        props: {
            urls,
            shippingCharge,
            dod1ProductId: dod1ProductId ? dod1ProductId : '',
            dod2ProductId: dod2ProductId ? dod2ProductId : '',
            dod3ProductId: dod3ProductId ? dod3ProductId : '',
            dod4ProductId: dod4ProductId ? dod4ProductId : '',
        },
    };
};

const Image = ({imageUrl}: {imageUrl: string}) => {
    return (
        // <div className="position-relative">
        <img src={imageUrl} alt=""/>
        // </div>
    );
};

function SettingTitle({title}: {title: string}) {
    return (
        <h4 className={'fw-bold mt-5 mb-0 h5 text-uppercase'}>{title}</h4>
    );
}

function ImageColContainer(props: {
    children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className="col-md-4 col-xl-2 col-lg-3 mt-3">
            {props.children}
        </div>
    );
}

/*
    <label htmlFor={props.label} className={'img-label'
        + (props.imageUrl ? ' has-image' : '')}>

        {props.imageUrl ? 'Change Image' : 'Choose Image'}
        <input id={props.label} type="file" name={props.label} ref={ref} onChange={props.onChange}
               accept="image/jpeg, image/png" className={'mb-2'}/>
    </label>
    {
        props.imageUrl && <Image imageSrc={props.imageUrl}/>
    }
* */

const ImageCol = React.forwardRef((
    props: {
        imageUrl: string;
        onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
        name: string;
        label?: string
        text?: string;
        onTextChange?: React.ChangeEventHandler<HTMLInputElement>;
    },
    ref: any,
) => {

    return (
        <ImageColContainer>
            {
                props.text !== undefined &&
                <div className="form-group mb-3">
                    <input type="text" className="form-control" value={props.text || ''} onChange={props.onTextChange}
                           placeholder={'Product ID'}/>
                </div>
            }

            <label htmlFor={props.name} className={'img-label'
            + (props.imageUrl ? ' has-image' : '')}>
                {props.imageUrl ? 'Change Image' : 'Choose Image'}
                <input type="file" id={props.name} name={props.label} ref={ref} onChange={props.onChange}
                       accept="image/jpeg, image/png" className={'mb-2'}/>
            </label>
            <label htmlFor={props.name}>
                {
                    props.imageUrl && <Image imageUrl={props.imageUrl}/>
                }
            </label>
        </ImageColContainer>
    );
});
