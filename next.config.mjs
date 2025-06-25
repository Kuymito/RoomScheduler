/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'media.istockphoto.com',
            'jaybird-new-previously.ngrok-free.app',
            // Add other domains you need here
          ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
                port: '',
                pathname: '/**',
            },
        ]
    },
};

export default nextConfig;
