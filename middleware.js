const BLOCKED = [
  '/data',
  '/src',
  '/node_modules',
  '/lib',
  '/quiz',
  '/academy-app',
  '/scripts',
  '/.env',
  '/package.json',
  '/package-lock.json',
];

export default function middleware(request) {
  const { pathname } = new URL(request.url);
  const blocked = BLOCKED.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(`${prefix}.`)
  );
  if (blocked) return new Response('Not found', { status: 404 });
}

export const config = {
  matcher: [
    '/data/:path*',
    '/src/:path*',
    '/node_modules/:path*',
    '/lib/:path*',
    '/quiz/:path*',
    '/academy-app/:path*',
    '/scripts/:path*',
  ],
};
