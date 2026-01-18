import { PUBLIC_CONVEX_URL } from '$env/static/public';

export async function load({ locals, url }: any) {
	console.log('=== Debug Page Load ===');
	console.log('URL:', url.pathname);

	const authCookie = locals.cookies.get('convex-auth-token');

	return {
		isAuthenticated: !!authCookie,
		authCookie: authCookie?.value,
		timestamp: new Date().toISOString(),
		mode: import.meta.env.MODE,
		convexUrl: PUBLIC_CONVEX_URL
	};
}
