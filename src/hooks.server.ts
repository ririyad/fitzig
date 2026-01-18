import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import {
	createConvexAuthHooks,
	createRouteMatcher
} from '@mmailaender/convex-auth-svelte/sveltekit/server';

const isPublicRoute = createRouteMatcher(['/login', '/register', '/']);

const { handleAuth, isAuthenticated } = createConvexAuthHooks();

const requireAuth = async ({ event, resolve }: any) => {
	console.log('=== Auth Middleware ===');
	console.log('Request path:', event.url.pathname);
	console.log('Method:', event.request.method);

	try {
		if (isPublicRoute(event.url.pathname)) {
			console.log('✓ Public route, skipping auth check');
			return resolve(event);
		}

		console.log('Checking authentication...');
		const authenticated = await isAuthenticated(event);
		console.log('Authenticated:', authenticated);

		if (!authenticated) {
			console.log('✗ Not authenticated, redirecting to login');
			throw redirect(302, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
		}

		console.log('✓ Authenticated, proceeding');
		return resolve(event);
	} catch (e: any) {
		console.error('Auth middleware error:', e);
		console.error('Error type:', e?.name, e?.message, e?.code);

		if (e?.status === 302) {
			console.log('Re-throwing redirect');
			throw e;
		}

		console.log('Fallback redirect to login');
		throw redirect(302, '/login');
	}
};

export const handle = sequence(handleAuth, requireAuth);
