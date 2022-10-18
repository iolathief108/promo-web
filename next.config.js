/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    async rewrites() {
        return [
            {
                source: '/admin/edit/:pid',
                destination: '/admin/create',
            },
            {
                source: '/admin/products',
                destination: '/admin',
            },
            {
                source: '/search/:key',
                destination: '/search',
            },
            {
                source: '/search/:cat/:key',
                destination: '/search',
            },
            {
                source: '/:cat',
                destination: '/search',
            },
            {
                source: '/api/product/:pid',
                destination: '/api/product',
            },
            {
                source: '/api/login/otp',
                destination: '/api/user/otp',
            },
            {
                source: '/test_payment_2',
                destination: '/test_payment',
            }
        ];
    },
};

module.exports = nextConfig;
