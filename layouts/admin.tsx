import {Sidenav} from '../comps/sidenav';
import {useEffect} from 'react';
import {Fetcher} from '../lib/fetcher';
import configState from '../states/config';
import {useSnapshot} from 'valtio';
import Router from 'next/router';
import Head from 'next/head';


const AdminLayout = (prop: {children: any}) => {

    const {isAdminLoading, isAdmin} = useSnapshot(configState);
    // const [init, setInit] = useState(false);

    useEffect(() => {
        // if (init) {
        //     return;
        // }
        if (!isAdmin) {
            Fetcher.get('/admin/login').then(res => {
                if (res.data) {
                    configState.isAdmin = true;
                    // setInit(true);
                }
                configState.isAdminLoading = false;
            }).catch(hel => {
                Router.push('/admin/login');
                configState.isAdminLoading = false;
            });
        }
    }, []);

    if (isAdminLoading) {
        return (
            <div>Loading...</div>
        );
    }

    if (!isAdmin) {
        return (
            <div>You are not an admin</div>
        );
    }

    return (
        <>
            <Head>
                <title>Admin</title>
            </Head>
            <Sidenav/>
            <main className={'admin-main mt-4 ps-4'}>
                {prop.children}
            </main>
        </>
    );
};


export default AdminLayout;
