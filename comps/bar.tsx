import Link from 'next/link';


export function Bar() {
    return (
        <div className={'dev-header'}>
            <Link href={'/'}>Home</Link>
            <Link href={'/search'}>Search</Link>
            <Link href={'/admin'}>Admin</Link>
            <Link href={'/admin/create'}>Create</Link>
            <Link href={'/admin/login'}>Admin Login</Link>
            <Link href={'/admin/settings'}>Settings</Link>
            <Link href={'/admin/settings'}>Docs</Link>
            <Link href={'/admin/create'}>New Product</Link>
        </div>
    );
}
