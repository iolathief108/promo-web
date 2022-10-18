import {useSnapshot} from 'valtio';
import frontState from '../states/front';
import {Breadcrumb} from './header/breadcrumb';
import Link from 'next/link';
import profileState from '../states/profile';
import {useHasHydrated} from '../lib/utils';


export function Sidebar() {
    const {isSidebarActive} = useSnapshot(frontState);
    const {id, firstName, lastName} = useSnapshot(profileState);
    const hasHydrated = useHasHydrated();

    return (
        <>
            <div className={`sidebar ${isSidebarActive ? 'active' : ''} `}>
                <div className={'sidebar-inner'}>
                    <Breadcrumb forceClose black/>
                    <div className={'sidebar-content'}>
                        <ul>
                                <Link href="/">
                            <li>
                                    <a>Home</a>
                            </li>
                                </Link>
                                <Link href="/about">
                            <li>
                                    <a>About</a>
                            </li>
                                </Link>
                                <Link href="/contact">
                            <li>
                                    <a>Contact</a>
                            </li>
                                </Link>
                                <Link href="/cart">
                            <li>
                                    <a>Cart</a>
                            </li>
                                </Link>
                            {
                                !id && hasHydrated && (
                                        <Link href="/login">
                                    <li>
                                            <a>Login</a>
                                    </li>
                                        </Link>
                                )
                            }
                            {
                                id && hasHydrated && (
                                    <>
                                        <h4 className={'ms-2 mt-5 mb-2'}>{firstName} {lastName}</h4>
                                            <Link href="/profile">
                                        <li className={''}>
                                                <a>Profile</a>
                                        </li>
                                            </Link>
                                            <Link href="/orders">
                                        <li>
                                                <a>Orders</a>
                                        </li>
                                            </Link>
                                    </>
                                )
                            }
                        </ul>


                        <div className={'contact-info'}>
                            <div className={'contact-info-item'}>
                                <div className={'contact-info-item-icon'}>
                                    <i className="fas fa-map-marker-alt"/>
                                </div>
                                <div className={'contact-info-item-text'}>
                                    <span>Address</span>
                                    <span>123, Main Street, Singapore</span>
                                </div>
                            </div>
                            <div className={'contact-info-item'}>
                                <div className={'contact-info-item-icon'}>
                                    <i className="fas fa-phone"/>
                                </div>
                                <div className={'contact-info-item-text'}>
                                    <span>Phone</span>
                                    <span>+65 0000 000</span>
                                </div>
                            </div>
                            <div className={'contact-info-item'}>
                                <div className={'contact-info-item-icon'}>
                                    <i className="fas fa-envelope"/>
                                </div>
                                <div className={'contact-info-item-text'}>
                                    <span>Email</span>
                                    <span>
                                        <a href="mailto:info@hello.com">
                                            info@hello.com
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={'social-links'}>
                            <a href="https://www.facebook.com/">
                                <img
                                    height="30"

                                    src="/facebook.png" alt="facebook"/>
                            </a>
                            <a href="https://www.instagram.com/">
                                <img

                                    height="30"
                                    src="/instagram.png" alt="instagram"/>
                            </a>
                            <a href="https://www.twitter.com/">
                                <img

                                    height="30"
                                    src="/twitter.png" alt="twitter"/>
                            </a>
                        </div>

                    </div>
                </div>
            </div>

            {/* background */}
            <div
                onClick={() => frontState.isSidebarActive = false}
                className="alpha-background"/>
        </>
    );
}
