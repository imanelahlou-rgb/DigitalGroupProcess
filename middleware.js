const BLOCKED = ['/data', '/src', '/node_modules', '/lib', '/quiz'];

export default function middleware(request) {
  const { pathname } = new URL(request.url);
  const blocked = BLOCKED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (blocked) return new Response('Not found', { status: 404 });
}

export const config = {
  matcher: ['/data/:path*', '/src/:path*', '/node_modules/:path*', '/lib/:path*', '/quiz/:path*'],
};
