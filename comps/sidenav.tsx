import Link from 'next/link';
import {useRouter} from 'next/router';
import {Fetcher} from '../lib/fetcher';
import configState from '../states/config';


export function Sidenav() {

    const router = useRouter();
    // this is header with dark background
    return (
        <div className={'pt-3 sidenav'}>
            <div className={'pb-2'}>
                <h2 className={'px-2'}>Neat Kitch</h2>
            </div>
            <div className={'sidenav-body'}>
                <ul>
                    <li className={router.pathname === '/admin' ? 'active' : ''}>
                        <Link href={'/admin'}>Orders</Link>
                    </li>
                    <li className={router.pathname === '/admin/products' ? 'active' : ''}>
                        <Link href={'/admin/products'}>Products</Link>
                    </li>
                    {/*<li className={router.pathname === '/admin/create' ? 'active' : ''}>*/}
                    {/*    <Link href={'/admin/create'}>New Product</Link>*/}
                    {/*</li>*/}
                    <li className={router.pathname === '/admin/categories' ? 'active' : ''}>
                        <Link href={'/admin/categories'}>Categories</Link>
                    </li>
                    <li className={router.pathname === '/admin/settings' ? 'active' : ''}>
                        <Link href={'/admin/settings'}>Settings</Link>
                    </li>
                    <li className={router.pathname === '/admin/report' ? 'active' : ''}>
                        <Link href={'/admin/report'}>Report</Link>
                    </li>
                    <li>
                        <a className={'mt-3'} style={{cursor: 'pointer', color: 'red'}} onClick={
                            () => {
                                if (window.confirm('Are you sure you want to logout?')) {
                                    Fetcher.get('/admin/logout').then(res => {
                                        if (res.status === 200) {
                                            configState.isAdmin = false;
                                            window.location.href = '/admin/login';
                                            // router.push('/admin/login');
                                        }
                                    }).catch(err => {
                                        console.log(err);
                                    })
                                }
                            }
                        }>Logout</a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
