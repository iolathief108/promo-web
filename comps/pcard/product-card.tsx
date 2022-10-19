import {Product} from '@prisma/client';
import {getImageUrl} from '../../lib/config';
import Image from 'next/image';
import {getCategoryById} from '../../states/front';
import {useState} from 'react';
import {Fetcher} from '../../lib/fetcher';


interface Props {
    product: Product;
}

export function ProductCard({product}: Props) {

    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');

    return (
        <div className={'pcard-outer'}>
            <div className={'inner row'}>
                <div className={'image col-6 col-sm-3 pe-0'}>
                    <div className={'image-container position-relative'}>
                        <Image src={getImageUrl(product.imageId)} alt={product.name} height={225} width={300}/>
                        <h2 className={'name'}>{product.name}</h2>
                    </div>
                </div>

                <div className={'info col-6 col-sm-7 pe-3 ps-3'}>
                    <div className={'row'}>
                        {/*<p>{*/}
                        {/*    getCategoryById(product.categoryId)?.name*/}
                        {/*}</p>*/}
                        <p className={'mb-2'} style={{
                            lineHeight: '1.2rem',
                        }}>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus adipisci alias Lorem
                            ipsum dolor sit amet, consectetur.
                        </p>
                        <p>
                            Unit Price: 100 LKR
                            <br/>
                            Min Qty: 10
                        </p>
                    </div>
                </div>

                <div className={'contact col-12 col-sm-2 pe-0 ps-0'} style={{
                    marginLeft: '-10px',
                    marginRight: '-10px',
                    width: '18%',
                }}>
                    <form style={{
                        // maxWidth: '130px',
                        marginLeft: 'auto',
                    }} onSubmit={(e) => {
                        e.preventDefault();
                        // Fetcher.post('/api/contact', {
                        //     contact,
                        //     message,
                        //     productId: product.id,
                        // }).then(() => {
                        //     setContact('');
                        //     setMessage('');
                        // });
                    }}>
                        <input placeholder={'Contact No'} className={'w-100 me-0 mt-0 mb-0'} type="text" value={contact}
                               onChange={(e) => {
                                   setContact(e.target.value);
                               }}/>
                        <textarea placeholder={'Message'} className={'w-100 mb-0'} name="" id="" cols={10} rows={2}
                                  value={message}
                                  onChange={(e) => {
                                      setMessage(e.target.value);
                                  }}/>
                        <button className={'btn btn-primary w-100 bg-black'} style={{
                            color: 'white',
                            fontSize: '14.5px',
                            paddingLeft: '0',
                            paddingRight: '0',
                        }} onClick={() => {
                            if (contact.length === 0) {
                                alert('Please enter your contact number');
                                return;
                            }
                            if (message.length === 0) {
                                alert('Please enter your message');
                                return;
                            }
                            Fetcher.post('/message', {
                                contact,
                                message,
                            }).then(() => {
                                setContact('');
                                setMessage('');
                            });
                        }}>Get Quote
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
