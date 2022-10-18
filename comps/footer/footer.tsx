import React from 'react';
import Link from 'next/link';
import {Breadcrumb} from '../header/breadcrumb';


type Props = {
    title: string
    links: {
        name: string
        href: string
    }[]
}
const SingleCol = (props: Props) => {
    return (
        <>
            <h5 className={'mb-3'}>
                {props.title}
            </h5>
            <ul className={'list-unstyled'}>
                {props.links.map((link, index) => {
                        return (
                            <li key={index}>
                                <Link href={link.href}>
                                    <a className={''}>{link.name}</a>
                                </Link>
                            </li>
                        );
                    },
                )}
            </ul>
        </>
    );
};

export function Footer() {
    return (
        <>
            <div className={'footer'}>
                <div className="container fs-6 pt-1 pb-2">
                    <div className={'row px-md-6'}>
                        <div className={'col-6 col-md-2'}>
                            <SingleCol title={'Links'} links={[
                                {
                                    name: 'Find All',
                                    href: '/search',
                                },
                                {
                                    name: 'About Us',
                                    href: '/about',
                                },
                                {
                                    name: 'Contact',
                                    href: '/contact',
                                },
                                {
                                    name: 'Privacy Policy',
                                    href: '/privacy',
                                },
                            ]}/>
                        </div>
                        <div className={'col-6 col-md-2'}>
                            <SingleCol title={'Account'} links={[
                                {
                                    name: 'Orders',
                                    href: '/orders',
                                },
                                {
                                    name: 'Profile',
                                    href: '/profile',
                                },
                                {
                                    name: 'Cart',
                                    href: '/cart',
                                },
                                {
                                    name: 'Checkout',
                                    href: '/checkout',
                                },
                            ]}/>
                        </div>
                        <div className={'col-12 col-md-4 col-lg-3 ms-auto ps-xl-6'}>
                            <div className={'logo'}>
                                <Link href="/">
                                    <img
                                        src="/logo-white.png"
                                        alt="logo"/>
                                </Link>
                            </div>
                            <div className={'social mt-3'}>
                                {/*<span className={'me-2'}>Follow us: </span>*/}
                                <a className={'me-4'} href={'https://www.facebook.com/'} target={'_blank'}>
                                    <i className="fab fa-facebook-f"/>
                                </a>
                                <a className={'me-4'} href={'https://www.instagram.com/'} target={'_blank'}>
                                    <i className="fab fa-instagram"/>
                                </a>
                                <a className={'me-3'} href={'https://www.twitter.com/'} target={'_blank'}>
                                    <i className="fab fa-twitter"/>
                                </a>
                            </div>

                            <div className={'payment mt-2'}>
                                <span className={'pb-1 d-inline-block'}>Payment methods: </span>
                                <img
                                    src="/static/payment1.png"
                                    alt="logo"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FooterBottom/>
        </>
    );
}

function FooterBottom() {
    return (
        <div className={'copy-bottom mt-3 '}>
            <div className={'container'}>

                <div className={'text-center mb-0 mt-2 py-2'}>
                    <small>
                        {/*Neatkitch 2022, All Rights Reserved*/}
                        <span>Neatkitch
                            {/*&copy; */}
                            <span>&nbsp;</span>
                            {new Date().getFullYear()},</span>
                        <span>&nbsp;</span>
                        <span>All Rights Reserved</span>
                    </small>
                </div>

                <div className={'row px-6 d-none'}>
                    <div className={'col-12 col-md-4 mb-0 mt-2 py-3'}>
                        <small>
                            <span>&copy; {new Date().getFullYear()}</span>
                            <span>&nbsp;</span>
                            <span>All Rights Reserved</span>
                        </small>
                    </div>
                    <div className={'col-12 col-md-4 mb-0 text-end mt-2 py-3'}>
                        {/*<small>*/}
                        {/*    <span>&copy; {new Date().getFullYear()}</span>*/}
                        {/*    <span>&nbsp;</span>*/}
                        {/*    <span>All Rights Reserved</span>*/}
                        {/*</small>*/}
                    </div>
                    <div className={'col-12 col-md-4  mb-0 text-center mt-2 py-3'}>
                        <div className={'payment'}>
                            <img
                                src="/static/payment1.png"
                                alt="logo"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// export function Footer() {
//     return (
//         <div className="container text-center fs-6 opacity-75 pt-0 pb-3">
//             <div className={'row px-6 align-middle'}>
//                 <div className={'d-flex col-auto me-auto align-middle align-items-center'}>
//                     <Link href={'/'}>
//                         <a className={'fs-6 me-3'}>Home</a>
//                     </Link>
//                     <Link href={'/about'}>
//                         <a className={'fs-6 me-3'}>About</a>
//                     </Link>
//                     <Link href={'/contact'}>
//                         <a className={'fs-6 me-3'}>Contact</a>
//                     </Link>
//                 </div>
//
//                 <p className={'col-auto m-auto'}>
//                     Copyright © 2020 All rights reserved.
//                 </p>
//                 <div className={'d-flex col-auto ms-auto align-middle align-items-center'}>
//                     <a className={'me-3'} href={'https://www.facebook.com/'}>
//                         <i className={'fab fa-facebook-f'}/>
//                     </a>
//                     <a className={'me-3'} href={'https://www.instagram.com/'}>
//                         <i className={'fab fa-instagram'}/>
//                     </a>
//                     <a className={''} href={'https://www.twitter.com/'}>
//                         <i className={'fab fa-twitter'}/>
//                     </a>
//                 </div>
//             </div>
//         </div>
//     );
// }
