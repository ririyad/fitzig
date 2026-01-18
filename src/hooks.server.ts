import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';

const isPublicRoute = (pathname: string) => {
	return ['/login', '/register', '/', '/debug'].includes(pathname);
};

const requireAuth = async ({ event, resolve }: any) => {
	console.log('=== Auth Middleware ===');
	console.log('Request path:', event.url.pathname);
	console.log('Method:', event.request.method);

	if (isPublicRoute(event.url.pathname)) {
		console.log('✓ Public route, skipping auth check');
		return resolve(event);
	}

	const authCookie = event.cookies.get('convex-auth-token');
	console.log('Auth cookie present:', !!authCookie);

	if (!authCookie) {
		console.log('✗ No auth cookie, redirecting to login');
		throw redirect(302, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
	}

	console.log('✓ Authenticated, proceeding');
	return resolve(event);
};

export const handle = sequence(requireAuth);
