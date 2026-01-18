import { ConvexHttpClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL } from '$env/static/public';

const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL || '');

export async function load({ locals, url }: any) {
	console.log('=== Layout Server Load ===');
	console.log('URL:', url.pathname);

	const authCookie = locals.cookies.get('convex-auth-token');
	console.log('Auth cookie:', authCookie);

	const isAuthenticated = !!authCookie;
	console.log('Is authenticated:', isAuthenticated);

	return {
		isAuthenticated,
		authCookie: authCookie?.value
	};
}
